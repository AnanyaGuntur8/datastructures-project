// src/simulator/engine/Interpreter.js
export default function Interpreter(info) {
  const frames = [];

  const state = {
    stack: [],
    list: [],
    grid: [],
    pointers: {},
    action: "",
  };

  const pushFrame = () => frames.push(JSON.parse(JSON.stringify(state)));

  const codeLines = (info.code || "").split("\n");

  for (let line of codeLines) {
    line = line.trim();

    // STACK
    if (info.usesStack) {
      if (line.includes("push")) {
        const val = line.match(/\((.*)\)/)?.[1] ?? "?";
        state.stack.push(val);
        state.action = `stack.push(${val})`;
        pushFrame();
      }
      if (line.includes("pop")) {
        const val = state.stack.pop();
        state.action = `stack.pop() → ${val}`;
        pushFrame();
      }
    }

    // LINKED LIST
    if (info.usesListNode) {
      const match = line.match(/new ListNode\((.*)\)/);
      if (match) {
        state.list.push(match[1]);
        state.action = `add ListNode(${match[1]})`;
        pushFrame();
      }
    }

    // MATRIX / GRID
    if (info.usesGrid) {
      const match = line.match(/grid\[(\d+)\]\[(\d+)\]/);
      if (match) {
        const [, i, j] = match;
        state.action = `visit grid[${i}][${j}]`;
        state.pointers.cell = { i, j };
        pushFrame();
      }
    }

    // METHOD declaration
    if (info.usesMethod && line.startsWith("public")) {
      state.action = `Method detected: ${line}`;
      pushFrame();
    }
  }

  // Always ensure at least one frame exists
  if (!frames.length) {
    pushFrame();
    state.action = "No visualizable operations yet";
  }

  return frames;
}
