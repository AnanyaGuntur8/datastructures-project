// src/simulator/ProblemStatement.jsx
export default function ProblemStatement({ title, description, signature }) {
  return (
    <div style={{ padding: 20, borderBottom: "1px solid #ddd" }}>
      <h2>{title}</h2>
      {signature && <pre style={{ background: "#f5f5f5", padding: 10 }}>{signature}</pre>}
      <p>{description}</p>
    </div>
  );
}
