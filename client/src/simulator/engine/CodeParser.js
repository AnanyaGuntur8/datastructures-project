// src/simulator/engine/CodeParser.js
export default function CodeParser(code = "") {
  const lower = code.toLowerCase();

  const usesStack = /\bstack\b|\.push\(|\.pop\(|push\(|pop\(/i.test(code);
  const usesListNode = /listnode|node\s*\w*\s*=\s*new\s+listnode/i.test(code);
  const usesGrid = /\b(grid|matrix|board)\b|new\s+int\s*\[\s*\]/i.test(code);
  const usesQueue = /queue|offer\(|poll\(|add\(|remove\(/i.test(code);
  const usesMap = /hashmap|map\b|\.put\(|new\s+HashMap\b/i.test(code);

  const dataStructures = {};
  if (usesStack) dataStructures["stack1"] = { type: "stack", items: [] };
  if (usesQueue) dataStructures["queue1"] = { type: "queue", items: [] };
  if (usesListNode) dataStructures["linkedList1"] = { type: "linkedlist", nodes: [] };
  if (usesGrid) dataStructures["matrix1"] = { type: "matrix", grid: [] };
  if (usesMap) dataStructures["map1"] = { type: "map", map: {} };

  // Build a short intent summary
  const detected = [];
  if (usesStack) detected.push("stack");
  if (usesQueue) detected.push("queue");
  if (usesListNode) detected.push("linked list");
  if (usesMap) detected.push("map");
  if (usesGrid) detected.push("matrix/grid");

  let intent = "No obvious data structure detected.";
  if (detected.length > 0) {
    intent = `Detected ${detected.join(", ")} in the code. Likely intent: ${detected
      .map((d) => {
        if (d === "stack") return "use a stack for LIFO operations (e.g., DFS/backtracking)";
        if (d === "queue") return "use a queue for FIFO operations (e.g., BFS)";
        if (d === "linked list") return "manipulate linked list nodes (insert/remove/traverse)";
        if (d === "matrix/grid") return "operate on 2D grids (BFS/DP/matrix traversal)";
        if (d === "map") return "use a map/hashmap to store key->value mappings";
        return d;
      })
      .join("; ")}.`;
  }

  // Extract array initializers
  const arraysMap = {};
  const arrayInitRe = /(?:int|long|double|String|char|boolean)\s*\[\s*\]\s*(\w+)\s*=\s*(?:new\s+\w+\s*)?\{([^}]*)\}/g;
  let am;
  while ((am = arrayInitRe.exec(code))) {
    const arrName = am[1].trim();
    const items = am[2].split(',').map(s => s.trim()).filter(Boolean);
    arraysMap[arrName] = items;
  }

  // Extract variable declarations for reference
  const variablesMap = {};
  const varDeclRe = /(?:int|long|double|String|char|boolean)\s+(\w+)\s*=\s*([^;\n]+)/g;
  let vd;
  while ((vd = varDeclRe.exec(code))) {
    const varName = vd[1].trim();
    const varValue = vd[2].trim();
    // Try to parse as number
    const numMatch = varValue.match(/^(\d+)$/);
    if (numMatch) {
      variablesMap[varName] = parseInt(numMatch[1], 10);
    }
  }

  const actions = [];

  // Helper to extract balanced braces
  function extractBracedContent(str, startIdx) {
    let depth = 0;
    let started = false;
    for (let i = startIdx; i < str.length; i++) {
      if (str[i] === '{') {
        depth++;
        started = true;
      } else if (str[i] === '}') {
        depth--;
        if (started && depth === 0) {
          return str.substring(startIdx + 1, i);
        }
      }
    }
    return '';
  }

  // Helper to safely evaluate expressions
  function safeEval(expr, context = {}) {
    try {
      // Replace variables in context
      let processed = expr;
      for (const [key, val] of Object.entries(context)) {
        processed = processed.replace(new RegExp(`\\b${key}\\b`, 'g'), String(val));
      }
      
      // Only allow simple arithmetic
      if (/^[\d\s\+\-\*\/\(\)]+$/.test(processed)) {
        return eval(processed);
      }
      
      // Try parsing as number
      const num = parseInt(processed, 10);
      if (!isNaN(num)) return num;
      
      return 0;
    } catch (e) {
      return 0;
    }
  }

  // UNIVERSAL FOR LOOP PARSER
  // Matches: for (int i = START; i < LIMIT; i++) or for (int i = START; i <= LIMIT; i++)
  const forLoopRe = /for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*([^;]+)\s*;\s*\1\s*(<|<=)\s*([^;]+)\s*;\s*\1\+\+\s*\)\s*\{/g;
  
  // PARSE ALL LOOPS FIRST
  const loopData = [];
  let loopMatch;
  
  while ((loopMatch = forLoopRe.exec(code))) {
    const loopVar = loopMatch[1];
    const startExpr = loopMatch[2].trim();
    const operator = loopMatch[3];
    const limitExpr = loopMatch[4].trim();
    const loopIndex = loopMatch.index;
    const loopBodyStart = loopIndex + loopMatch[0].length - 1;
    const loopBody = extractBracedContent(code, loopBodyStart);
    
    loopData.push({
      loopVar,
      startExpr,
      operator,
      limitExpr,
      loopIndex,
      loopBody,
      depth: 0
    });
  }

  // Calculate nesting depth
  for (let i = 0; i < loopData.length; i++) {
    for (let j = 0; j < loopData.length; j++) {
      if (i !== j) {
        const outer = loopData[j];
        const inner = loopData[i];
        const outerEnd = outer.loopIndex + outer.loopBody.length;
        
        if (inner.loopIndex > outer.loopIndex && inner.loopIndex < outerEnd) {
          loopData[i].depth++;
        }
      }
    }
  }

  // Process loops by depth (outermost first)
  const sortedLoops = [...loopData].sort((a, b) => a.depth - b.depth);

  // RECURSIVE LOOP EXECUTOR
  function executeLoop(loopInfo, parentContext = {}) {
    const { loopVar, startExpr, operator, limitExpr, loopBody } = loopInfo;
    
    // Evaluate start and limit with parent context
    const start = safeEval(startExpr, parentContext);
    let limit;
    
    // Check if limit is an array.length expression
    const lengthMatch = limitExpr.match(/(\w+)\.length/);
    if (lengthMatch) {
      const arrName = lengthMatch[1];
      limit = arraysMap[arrName] ? arraysMap[arrName].length : 0;
    } else {
      limit = safeEval(limitExpr, { ...parentContext, ...variablesMap });
    }
    
    // Adjust limit for <= operator
    const actualLimit = operator === '<=' ? limit + 1 : limit;
    
    // Check for nested loop in body
    const nestedLoopMatch = loopBody.match(/for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*([^;]+)\s*;\s*\1\s*(<|<=)\s*([^;]+)\s*;\s*\1\+\+\s*\)\s*\{/);
    
    // ITERATE THIS LOOP
    for (let i = start; i < actualLimit; i++) {
      const currentContext = { ...parentContext, [loopVar]: i };
      
      actions.push({
        type: 'set_var',
        name: loopVar,
        value: String(i),
        comment: `Loop ${loopVar}=${i}`
      });
      
      if (nestedLoopMatch) {
        // NESTED LOOP FOUND - RECURSE
        const nestedVar = nestedLoopMatch[1];
        const nestedStart = nestedLoopMatch[2].trim();
        const nestedOp = nestedLoopMatch[3];
        const nestedLimit = nestedLoopMatch[4].trim();
        const nestedBodyStart = loopBody.indexOf('{', nestedLoopMatch.index);
        const nestedBody = extractBracedContent(loopBody, nestedBodyStart);
        
        const nestedLoop = {
          loopVar: nestedVar,
          startExpr: nestedStart,
          operator: nestedOp,
          limitExpr: nestedLimit,
          loopBody: nestedBody
        };
        
        executeLoop(nestedLoop, currentContext);
      } else {
        // NO NESTED LOOP - PROCESS BODY
        processLoopBody(loopBody, currentContext);
      }
    }
  }

  // PROCESS LOOP BODY (no nested loops)
  function processLoopBody(body, context) {
    // Substitute all variables and array accesses
    let processedBody = body;
    
    // Replace array accesses first
    for (const [arrName, arrItems] of Object.entries(arraysMap)) {
      for (const [varName, varValue] of Object.entries(context)) {
        const regex = new RegExp(`${arrName}\\[${varName}\\]`, 'g');
        processedBody = processedBody.replace(regex, arrItems[varValue] || '0');
      }
      
      // Also handle direct index access like arr[0]
      const directAccessRe = new RegExp(`${arrName}\\[(\\d+)\\]`, 'g');
      processedBody = processedBody.replace(directAccessRe, (match, idx) => {
        return arrItems[parseInt(idx, 10)] || '0';
      });
    }
    
    // Replace variables
    for (const [varName, varValue] of Object.entries(context)) {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      processedBody = processedBody.replace(regex, String(varValue));
    }
    
    // Also replace known variables from declarations
    for (const [varName, varValue] of Object.entries(variablesMap)) {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      processedBody = processedBody.replace(regex, String(varValue));
    }
    
    // Look for if statements
    const ifMatch = processedBody.match(/if\s*\(\s*([^)]+)\s*\)/);
    if (ifMatch) {
      const condition = ifMatch[1].trim();
      
      actions.push({
        type: 'evaluate_condition',
        condition: condition,
        context: context,
        comment: `Check: ${condition}`
      });
      
      const ifBodyStart = processedBody.indexOf('{', ifMatch.index);
      if (ifBodyStart !== -1) {
        const ifBody = extractBracedContent(processedBody, ifBodyStart);
        
        // Check for return
        const returnMatch = ifBody.match(/return\s+new\s+int\s*\[\s*\]\s*\{\s*([^}]+)\s*\}/);
        if (returnMatch) {
          let returnVals = returnMatch[1].trim();
          // Substitute variables in return
          for (const [varName, varValue] of Object.entries(context)) {
            returnVals = returnVals.replace(new RegExp(`\\b${varName}\\b`, 'g'), String(varValue));
          }
          
          actions.push({
            type: 'return',
            value: returnVals,
            comment: `Return [${returnVals}]`
          });
        }
        
        // Check for other return types
        const simpleReturnMatch = ifBody.match(/return\s+([^;]+)/);
        if (simpleReturnMatch && !returnMatch) {
          let returnVal = simpleReturnMatch[1].trim();
          for (const [varName, varValue] of Object.entries(context)) {
            returnVal = returnVal.replace(new RegExp(`\\b${varName}\\b`, 'g'), String(varValue));
          }
          
          actions.push({
            type: 'return',
            value: returnVal,
            comment: `Return ${returnVal}`
          });
        }
        
        // Check for push in if
        const pushInIf = ifBody.match(/\.push\(\s*([^)]+)\)/);
        if (pushInIf) {
          actions.push({
            type: 'push',
            target: 'stack1',
            value: pushInIf[1].trim()
          });
        }
      }
    }
    
    // Look for push outside if
    const pushMatch = processedBody.match(/\.push\(\s*([^)]+)\)/);
    if (pushMatch && !ifMatch) {
      actions.push({
        type: 'push',
        target: 'stack1',
        value: pushMatch[1].trim()
      });
    }
    
    // Look for other operations
    const popMatch = processedBody.match(/\.pop\(\s*\)/);
    if (popMatch) {
      actions.push({ type: 'pop', target: 'stack1' });
    }
  }

  // EXECUTE ALL TOP-LEVEL LOOPS
  const topLevelLoops = sortedLoops.filter(l => l.depth === 0);
  for (const loop of topLevelLoops) {
    executeLoop(loop, {});
  }

  // Process while loops
  const whileLoopRe = /while\s*\(\s*(\w+)\s*(<|<=)\s*(\d+)\s*\)\s*\{/g;
  let wl;
  while ((wl = whileLoopRe.exec(code))) {
    const varName = wl[1];
    const operator = wl[2];
    const limit = parseInt(wl[3], 10);
    
    const bodyStartIdx = wl.index + wl[0].length - 1;
    const body = extractBracedContent(code, bodyStartIdx);
    
    // Find initial value
    const codeBeforeLoop = code.substring(0, wl.index);
    const initMatch = codeBeforeLoop.match(new RegExp(`(?:int\\s+)?${varName}\\s*=\\s*(\\d+)`, 'g'));
    let currentVal = 0;
    if (initMatch && initMatch.length > 0) {
      const lastMatch = initMatch[initMatch.length - 1];
      const valMatch = lastMatch.match(/=\s*(\d+)/);
      if (valMatch) currentVal = parseInt(valMatch[1], 10);
    }
    
    const hasIncrement = body.includes(`${varName}++`) || body.includes(`++${varName}`);
    const actualLimit = operator === '<=' ? limit + 1 : limit;
    
    const maxIterations = 1000;
    let iterations = 0;
    
    while (currentVal < actualLimit && iterations < maxIterations) {
      actions.push({
        type: 'set_var',
        name: varName,
        value: String(currentVal),
        comment: `While ${varName}=${currentVal}`
      });
      
      processLoopBody(body, { [varName]: currentVal });
      
      if (hasIncrement) {
        currentVal++;
      } else {
        break;
      }
      
      iterations++;
    }
  }

  // Process for-each loops
  const forEachRe = /for\s*\(\s*(?:[\w<>\[\]]+\s+)?(\w+)\s*:\s*(\w+)\s*\)\s*\{/g;
  let fe;
  while ((fe = forEachRe.exec(code))) {
    const elemVar = fe[1];
    const arrName = fe[2];
    const bodyStartIdx = fe.index + fe[0].length - 1;
    const body = extractBracedContent(code, bodyStartIdx);
    const arrItems = arraysMap[arrName];
    
    if (arrItems) {
      for (const itemVal of arrItems) {
        actions.push({
          type: 'set_var',
          name: elemVar,
          value: itemVal,
          comment: `For-each ${elemVar}=${itemVal}`
        });
        
        processLoopBody(body, { [elemVar]: itemVal });
      }
    }
  }

  // Process standalone actions (outside loops)
  const pushRe = /\.push\(\s*([^\)]+)\)/g;
  let m;
  const loopRanges = loopData.map(l => ({
    start: l.loopIndex,
    end: l.loopIndex + l.loopBody.length + 100
  }));
  
  while ((m = pushRe.exec(code))) {
    let isInLoop = false;
    for (const range of loopRanges) {
      if (m.index > range.start && m.index < range.end) {
        isInLoop = true;
        break;
      }
    }
    if (!isInLoop) {
      actions.push({ type: "push", target: "stack1", value: m[1].trim() });
    }
  }

  const popRe = /\.pop\(\s*\)/g;
  while ((m = popRe.exec(code))) {
    let isInLoop = false;
    for (const range of loopRanges) {
      if (m.index > range.start && m.index < range.end) {
        isInLoop = true;
        break;
      }
    }
    if (!isInLoop) {
      actions.push({ type: "pop", target: "stack1" });
    }
  }

  const addRe = /\.add\(\s*([^\)]+)\)/g;
  while ((m = addRe.exec(code))) {
    actions.push({ type: "enqueue", target: "queue1", value: m[1].trim() });
  }

  const offerRe = /\.offer\(\s*([^\)]+)\)/g;
  while ((m = offerRe.exec(code))) {
    actions.push({ type: "enqueue", target: "queue1", value: m[1].trim() });
  }

  const pollRe = /\.poll\(\s*\)|\.remove\(\s*\)/g;
  while ((m = pollRe.exec(code))) {
    actions.push({ type: "dequeue", target: "queue1" });
  }

  const newNodeRe = /new\s+ListNode\s*\(\s*([^\)]+)\)/gi;
  while ((m = newNodeRe.exec(code))) {
    actions.push({ type: "insert_node", target: "linkedList1", value: m[1].trim() });
  }

  const putRe = /\.put\(\s*([^,]+)\s*,\s*([^\)]+)\)/g;
  while ((m = putRe.exec(code))) {
    actions.push({ type: 'put', target: 'map1', key: m[1].trim(), value: m[2].trim() });
  }

  const mapRemoveRe = /\.remove\(\s*([^\)]+)\)/g;
  while ((m = mapRemoveRe.exec(code))) {
    actions.push({ type: 'map_remove', target: 'map1', key: m[1].trim() });
  }

  const mapGetRe = /\.get\(\s*([^\)]+)\)/g;
  while ((m = mapGetRe.exec(code))) {
    actions.push({ type: 'map_get', target: 'map1', key: m[1].trim() });
  }

  while ((m = varDeclRe.exec(code))) {
    const name = m[1].trim();
    const val = m[2].trim();
    actions.push({ type: "set_var", name, value: val });
  }

  const arrayNewRe = /(?:int|long|double|String|char|boolean)\s*\[\s*\]\s*(\w+)\s*=\s*(?:new\s+\w+\s*)?\{([^\}]*)\}/g;
  while ((m = arrayNewRe.exec(code))) {
    const name = m[1].trim();
    const items = m[2].split(',').map(s => s.trim()).filter(Boolean);
    actions.push({ type: "create_array", name, items });
  }

  const arraySetRe = /(\w+)\s*\[\s*(\d+)\s*\]\s*=\s*([^;\n]+)/g;
  while ((m = arraySetRe.exec(code))) {
    const name = m[1].trim();
    const idx = parseInt(m[2], 10);
    const val = m[3].trim();
    actions.push({ type: "array_set", name, index: idx, value: val });
  }

  return {
    dataStructures,
    intent,
    actions,
    raw: code || "",
  };
}