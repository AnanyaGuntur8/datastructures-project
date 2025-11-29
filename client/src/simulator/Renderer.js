import StackVis from "./visualizers/StackVis";
import LinkedListVis from "./visualizers/LinkedListVis";
import MatrixVis from "./visualizers/MatrixVis";
import ArrayVis from "./visualizers/ArrayVis";

export default function Renderer({ state }) {
  if (!state) return <p style={{ padding: 20 }}>Type code to see visualization</p>;

  return (
    <div style={{ padding: 20 }}>
      {/* Variables */}
      {state.vars && Object.keys(state.vars).length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Variables:</h3>
          {Object.entries(state.vars).map(([key, { value, updated }]) => (
            <div
              key={key}
              style={{
                marginBottom: "4px",
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: updated ? "#dfffa0" : "transparent",
                transition: "background-color 0.5s",
              }}
            >
              {key} = {value.toString()}
            </div>
          ))}
        </div>
      )}

      {/* Data structures */}
      {Object.keys(state).map((key) => {
        if (key === "vars") return null;
        const ds = state[key];

        if (ds.type === "stack") return <StackVis key={key} items={ds.items} />;
        if (ds.type === "linkedlist") return <LinkedListVis key={key} nodes={ds.nodes} />;
        if (ds.type === "matrix") return <MatrixVis key={key} grid={ds.grid} />;
        if (ds.type === "array") return <ArrayVis key={key} name={key} items={ds.items} />;

        return null;
      })}
    </div>
  );
}
