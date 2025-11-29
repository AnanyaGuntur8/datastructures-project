import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ArrayVis({ name, items }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h4>{name} (Array)</h4>
      <div style={{ display: "flex", gap: 8 }}>
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0, backgroundColor: "#f0f0f0" }}
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
              }}
            >
              {item}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
