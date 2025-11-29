import { motion } from "framer-motion";

export default function StackVis({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column-reverse", gap: "5px", marginBottom: "20px" }}>
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            padding: "8px 12px",
            background: "#4caf50",
            color: "white",
            borderRadius: "5px",
            minWidth: "40px",
            textAlign: "center",
          }}
        >
          {item}
        </motion.div>
      ))}
      <div style={{ padding: "4px", background: "#ccc", borderRadius: "5px", textAlign: "center" }}>Top</div>
    </div>
  );
}
