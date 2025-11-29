import { motion } from "framer-motion";

export default function MatrixVis({ grid }) {
  return (
    <div style={{ display: "inline-block", marginBottom: "20px" }}>
      {grid.map((row, i) => (
        <div key={i} style={{ display: "flex" }}>
          {row.map((cell, j) => (
            <motion.div
              key={j}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                width: 30,
                height: 30,
                margin: 2,
                background: "#ff9800",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
              }}
            >
              {cell}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}
