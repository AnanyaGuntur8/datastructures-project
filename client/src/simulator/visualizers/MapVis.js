import React from "react";

function simpleHash(str, buckets) {
  if (str == null) return 0;
  const s = String(str);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i)) % buckets;
  return h;
}

export default function MapVis({ map = {}, name = "map", bucketCount = 8 }) {
  // map expected shape: { entries: [{key, value}, ...] }
  const entries = (map && map.entries) || [];

  const buckets = Array.from({ length: bucketCount }, () => []);
  entries.forEach((e, i) => {
    const key = e && (e.key !== undefined ? e.key : e[0]);
    const value = e && (e.value !== undefined ? e.value : e[1]);
    const keyStr = typeof key === 'string' ? key.replace(/^\"|\"$/g, '') : String(key);
    const idx = simpleHash(keyStr, bucketCount);
    buckets[idx].push({ key: keyStr, value });
  });

  return (
    <div style={{ marginBottom: 20 }}>
      <h4>{name} (HashMap)</h4>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(bucketCount,4)}, 1fr)`, gap: 12 }}>
        {buckets.map((bucket, i) => (
          <div key={i} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6, background: '#fff' }}>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>Bucket {i}</div>
            {bucket.length === 0 && <div style={{ color: '#999', fontSize: 13 }}>empty</div>}
            {bucket.map((entry, j) => (
              <div key={j} style={{ marginBottom: 6, padding: '6px 8px', borderRadius: 4, background: '#e0f2f1' }}>
                <div style={{ fontSize: 12, color: '#00796b' }}><strong>{String(entry.key)}</strong></div>
                <div style={{ fontSize: 13, color: '#004d40' }}>{String(entry.value)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
