
import React from "react";

export default function QueueVis({ items = [], name = "queue" }) {
	return (
		<div style={{ marginBottom: 20 }}>
			<h4>{name} (Queue)</h4>
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				{items.length === 0 && (
					<div style={{ padding: 8, color: "#666" }}>empty</div>
				)}
				{items.map((item, idx) => (
					<div
						key={idx}
						style={{
							padding: "8px 12px",
							background: "#2196f3",
							color: "white",
							borderRadius: 6,
							minWidth: 40,
							textAlign: "center",
						}}
					>
						{item}
					</div>
				))}
				<div style={{ marginLeft: 8, color: "#888" }}>[rear]</div>
			</div>
		</div>
	);
}
