import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LinkedListVis({ nodes, name }) {
  // Always show the container
  return (
    <div style={{ marginBottom: 20 }}>
      <h4>{name} (LinkedList)</h4>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {/* Dummy head / container */}
        <div
          style={{
            width: 50,
            height: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px dashed #888",
            borderRadius: 4,
            fontWeight: "bold",
            color: "#aaa",
          }}
        >
          Head
        </div>

        {/* Render actual nodes dynamically */}
        <AnimatePresence>
          {nodes.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                width: 50,
                height: 50,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                border: "2px solid #888",
                borderRadius: 4,
                fontWeight: "bold",
                position: "relative",
              }}
            >
              {value}
              {index < nodes.length - 1 && (
                <span style={{ position: "absolute", right: -20, top: "50%" }}>
                  →
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
