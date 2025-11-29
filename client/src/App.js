import { useState } from "react";
import Visualizer from "./simulator/Visualizer";
import CodeEditor from "./simulator/CodeEditor";
import CodeParser from "./simulator/engine/CodeParser";
import problems from "./problems";
import { useEffect, useRef } from "react";

export default function App() {
  const [dataStructures, setDataStructures] = useState({}); // key: DS name, value: array
  const [code, setCode] = useState("");
  const [selectedProblem, setSelectedProblem] = useState(problems[0]?.id || "");
  const [intent, setIntent] = useState("");
  const [actions, setActions] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [autoRun, setAutoRun] = useState(true);
  const [simState, setSimState] = useState({});
  const [loadedExpected, setLoadedExpected] = useState(null);
  const stepRef = useRef(0);

  const handleCodeChange = (newCode) => {
    setCode(newCode);

    // Use a lightweight parser to detect data structures + intent
    const parsed = CodeParser(newCode || "");
    // CodeParser returns { dataStructures, intent }
    setDataStructures(parsed.dataStructures || {});
    setIntent(parsed.intent || "");
    setActions(parsed.actions || []);

    // initialize simState based on detected DS
    const initial = { vars: {} };
    Object.keys(parsed.dataStructures || {}).forEach((k) => {
      const ds = parsed.dataStructures[k];
      if (ds.type === "stack") initial[k] = { type: "stack", items: [] };
      if (ds.type === "queue") initial[k] = { type: "queue", items: [] };
      if (ds.type === "linkedlist") initial[k] = { type: "linkedlist", nodes: [] };
      if (ds.type === "matrix") initial[k] = { type: "matrix", grid: [] };
      if (ds.type === "array") initial[k] = { type: "array", items: [] };
      if (ds.type === "map") initial[k] = { type: "map", map: { entries: [] } };
    });
    setSimState(initial);
    stepRef.current = 0;
  };

  // load selected problem starter code into editor
  useEffect(() => {
    const p = problems.find((x) => x.id === selectedProblem) || problems[0];
    if (p) {
      setCode(p.starterCode || "");
      // run parser on the starter code
      const parsed = CodeParser(p.starterCode || "");
      setDataStructures(parsed.dataStructures || {});
      setIntent(parsed.intent || "");
      setActions(parsed.actions || []);

      // init sim state
      const initial = { vars: {} };
      Object.keys(parsed.dataStructures || {}).forEach((k) => {
        const ds = parsed.dataStructures[k];
        if (ds.type === "stack") initial[k] = { type: "stack", items: [] };
        if (ds.type === "queue") initial[k] = { type: "queue", items: [] };
        if (ds.type === "linkedlist") initial[k] = { type: "linkedlist", nodes: [] };
        if (ds.type === "matrix") initial[k] = { type: "matrix", grid: [] };
        if (ds.type === "array") initial[k] = { type: "array", items: [] };
        if (ds.type === "map") initial[k] = { type: "map", map: { entries: [] } };
      });
      setSimState(initial);
      stepRef.current = 0;
      setLoadedExpected(null);
    }
  }, [selectedProblem]);

  // Step through actions when playing or when autoRun is enabled
  useEffect(() => {
    if (!autoRun) return;
    if (!actions || actions.length === 0) return;

    setPlaying(true);
  }, [actions, autoRun]);

  useEffect(() => {
    if (!playing) return;
    if (!actions || actions.length === 0) return;

    const id = setInterval(() => {
      const idx = stepRef.current;
      if (idx >= actions.length) {
        clearInterval(id);
        setPlaying(false);
        return;
      }
      const a = actions[idx];
      // apply action
      setSimState((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        // helper to parse simple literal tokens
        const parseToken = (tok) => {
          if (tok == null) return tok;
          const s = String(tok).trim();
          // strip surrounding quotes
          const m = s.match(/^['"](.*)['"]$/);
          if (m) return m[1];
          if (/^-?\d+$/.test(s)) return parseInt(s, 10);
          if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
          return s;
        };

        const target = a.target || Object.keys(next).find(k=>k!=='vars');
        if (!target) return prev;

        if (a.type === "push") {
          if (!next[target]) next[target] = { type: "stack", items: [] };
          next[target].items = [...(next[target].items || []), a.value];
        }
        if (a.type === "pop") {
          if (next[target] && next[target].items && next[target].items.length > 0) {
            next[target].items = next[target].items.slice(0, -1);
          }
        }
        if (a.type === "enqueue") {
          if (!next[target]) next[target] = { type: "queue", items: [] };
          next[target].items = [...(next[target].items || []), a.value];
        }
        if (a.type === "dequeue") {
          if (next[target] && next[target].items && next[target].items.length > 0) {
            next[target].items = next[target].items.slice(1);
          }
        }

        // map operations
        if (a.type === 'put') {
          if (!next[a.target]) next[a.target] = { type: 'map', map: { entries: [] } };
          next[a.target].map = next[a.target].map || { entries: [] };
          const key = parseToken(a.key);
          const value = parseToken(a.value);
          const existing = next[a.target].map.entries.find((e) => String(e.key) === String(key));
          if (existing) existing.value = value; else next[a.target].map.entries.push({ key, value });
        }

        if (a.type === 'map_remove') {
          if (next[a.target] && next[a.target].map && Array.isArray(next[a.target].map.entries)) {
            const key = parseToken(a.key);
            next[a.target].map.entries = next[a.target].map.entries.filter((e) => String(e.key) !== String(key));
          }
        }

        if (a.type === 'map_get') {
          if (next[a.target] && next[a.target].map && Array.isArray(next[a.target].map.entries)) {
            const key = parseToken(a.key);
            const found = next[a.target].map.entries.find((e) => String(e.key) === String(key));
            next.vars = next.vars || {};
            next.vars[`last_get_${a.target}`] = { value: found ? found.value : null, updated: true };
          }
        }

        // variables
        if (a.type === 'set_var') {
          next.vars = next.vars || {};
          next.vars[a.name] = { value: parseToken(a.value), updated: true };
        }

        if (a.type === 'create_array') {
          next[a.name] = { type: 'array', items: a.items || [] };
        }

        if (a.type === 'array_set') {
          if (!next[a.name]) next[a.name] = { type: 'array', items: [] };
          next[a.name].items = next[a.name].items || [];
          next[a.name].items[a.index] = a.value;
        }

        if (a.type === 'insert_node') {
          if (!next[target]) next[target] = { type: 'linkedlist', nodes: [] };
          next[target].nodes = [...(next[target].nodes || []), a.value];
        }

        return next;
      });

      stepRef.current = idx + 1;
    }, 600);

    return () => clearInterval(id);
  }, [playing, actions]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Left: Problem + Editor (LeetCode-style) */}
      <div style={{ width: "62%", borderRight: "1px solid #e6e6e6", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 20, borderBottom: "1px solid #eee", background: "#fafafa" }}>
            <h2 style={{ margin: 0 }}>Playground</h2>
            <p style={{ marginTop: 6, color: "#444" }}>Type Java code in the editor below. The AI visualizer will detect data structures and show what the code is attempting to do in real time.</p>
            {/* Problem statement */}
            <div style={{ marginTop: 12, padding: 10, border: '1px solid #eee', borderRadius: 6, background: '#fff' }}>
              {problems.find((p) => p.id === selectedProblem) && (
                <div>
                  <strong>{problems.find((p) => p.id === selectedProblem).title}</strong>
                  <p style={{ margin: '8px 0', color: '#333' }}>{problems.find((p) => p.id === selectedProblem).description}</p>
                  <div style={{ color: '#666', fontSize: 13 }}>{problems.find((p) => p.id === selectedProblem).signature}</div>

                  {/* Tests */}
                  {problems.find((p) => p.id === selectedProblem).tests && (
                    <div style={{ marginTop: 10 }}>
                      <strong>Tests:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                        {problems.find((p) => p.id === selectedProblem).tests.map((t) => (
                          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 13 }}>
                              <div><strong>{t.id}</strong></div>
                              <div style={{ color: '#444' }}>input: {JSON.stringify(t.input)}</div>
                              <div style={{ color: '#444' }}>expected: {JSON.stringify(t.expected)}</div>
                            </div>
                            <div>
                              <button onClick={() => {
                                // load test inputs into simState
                                const next = { vars: {} };
                                Object.entries(t.input).forEach(([k, v]) => {
                                  if (Array.isArray(v)) {
                                    next[k] = { type: 'array', items: v };
                                  } else {
                                    next.vars[k] = { value: v, updated: false };
                                  }
                                });
                                setSimState(next);
                                setLoadedExpected(t.expected);
                              }}>Load input</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <select value={selectedProblem} onChange={(e) => setSelectedProblem(e.target.value)}>
                {problems.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>

              {/* Visible problems list (click to select) */}
              <div style={{ marginLeft: 12 }}>
                <strong>Problems</strong>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {problems.map((p) => (
                    <button key={p.id} onClick={() => setSelectedProblem(p.id)} style={{ padding: '6px 8px' }}>{p.title}</button>
                  ))}
                </div>
              </div>

            <button onClick={() => { setPlaying(true); stepRef.current = 0; }} style={{ marginRight: 8 }}>Run</button>
            <button onClick={() => { setPlaying(false); stepRef.current = 0; setSimState({ vars: {} }); }} style={{ marginRight: 8 }}>Reset</button>
            <label style={{ marginLeft: 8 }}>
              <input type="checkbox" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)} /> Auto-run
            </label>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <CodeEditor onCode={handleCodeChange} value={code} />
        </div>
      </div>

      {/* Right: Visualizer */}
      <div style={{ width: "38%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #eee" }}>
          <strong>AI Visualizer</strong>
          <div style={{ color: '#666', marginTop: 6 }}>{intent}</div>
          {loadedExpected && (
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <strong>Loaded test expected:</strong> <span style={{ color: '#333' }}>{JSON.stringify(loadedExpected)}</span>
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Visualizer dataStructures={simState} intent={intent} />
        </div>
      </div>
    </div>
  );
}
