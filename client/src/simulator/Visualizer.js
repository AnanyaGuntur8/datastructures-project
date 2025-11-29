import StackVisualizer from "./visualizers/StackVis";
import QueueVisualizer from "./visualizers/QueueVis";
import LinkedListVisualizer from "./visualizers/LinkedListVis";
import MatrixVis from "./visualizers/MatrixVis";
import MapVis from "./visualizers/MapVis";

export default function Visualizer({ dataStructures = {}, intent = "" }) {
  const dsKeys = Object.keys(dataStructures || {});

  return (
    <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Intent / Summary */}
      <div style={{ padding: 12, border: "1px dashed #bbb", borderRadius: 6, background: "#fff" }}>
        <strong>Detected intent:</strong>
        <div style={{ marginTop: 6 }}>{intent || "No intent detected yet."}</div>
      </div>
      {/* Variables Section */}
      <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 6, background: "#fafafa" }}>
        <h4 style={{ margin: '6px 0' }}>Variables</h4>
        {(dataStructures.vars && Object.keys(dataStructures.vars).length > 0) ? (
          Object.entries(dataStructures.vars).map(([k, { value, updated }]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: 6, background: updated ? '#e8ffe8' : 'transparent', borderRadius: 4, marginBottom: 6 }}>
              <div style={{ fontWeight: 600 }}>{k}</div>
              <div style={{ color: '#333' }}>{Array.isArray(value) ? `[${value.join(', ')}]` : String(value)}</div>
            </div>
          ))
        ) : (
          <div style={{ color: '#666' }}>No tracked variables yet.</div>
        )}
      </div>

      {/* Visualizer Section */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {dsKeys.length === 0 && <div style={{ padding: 20 }}>No data structures detected.</div>}

        {dsKeys.map((dsName) => {
          // skip vars key
          if (dsName === 'vars') return null;
          const ds = dataStructures[dsName] || {};
          if (dsName.toLowerCase().startsWith("stack"))
            return <StackVisualizer key={dsName} items={ds.items || []} />;
          if (dsName.toLowerCase().startsWith("queue"))
            return <QueueVisualizer key={dsName} items={ds.items || []} />;
          if (dsName.toLowerCase().startsWith("linkedlist") || dsName.toLowerCase().startsWith("linked"))
            return <LinkedListVisualizer key={dsName} nodes={ds.nodes || []} name={dsName} />;
          if (ds.type === 'matrix' || dsName.toLowerCase().startsWith('matrix'))
            return <MatrixVis key={dsName} grid={ds.grid || []} name={dsName} />;

          if (ds.type === 'map' || dsName.toLowerCase().startsWith('map'))
            return <MapVis key={dsName} map={ds.map || {}} name={dsName} />;

          if (ds.type === 'array' || dsName.toLowerCase().startsWith('array'))
            return (
              <div key={dsName} style={{ marginBottom: 20 }}>
                <h4>{dsName} (Array)</h4>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {(ds.items || []).map((it, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: '#ffb74d', borderRadius: 6 }}>{it}</div>
                  ))}
                </div>
              </div>
            );

          return (
            <div key={dsName} style={{ color: "red" }}>
              Unknown DS: {dsName}
            </div>
          );
        })}
      </div>
    </div>
  );
}
