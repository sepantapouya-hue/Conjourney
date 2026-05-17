function fmtTime(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function HistoryPanel({ history, pointer, onRestore, onClose }) {
  const items = [...history].map((h, i) => ({ ...h, idx: i })).reverse();
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="panel history">
        <div className="panel-head">
          <h2>Version history</h2>
          <button type="button" className="panel-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="panel-body">
          <p className="history-intro">
            In-memory snapshots from this session. Click any entry to restore
            that state — undo/redo update the pointer too.
          </p>
          <div className="history-list">
            {items.length === 0 && (
              <div className="empty">No history yet — edit something.</div>
            )}
            {items.map((h) => (
              <button
                key={h.idx}
                type="button"
                className={`history-row ${h.idx === pointer ? "current" : ""}`}
                onClick={() => onRestore(h.idx)}
              >
                <span className="history-bullet" />
                <span className="history-text">
                  <span className="history-label">{h.label}</span>
                  <span className="history-meta">
                    {fmtTime(h.at)} · {h.nodes.length} node
                    {h.nodes.length === 1 ? "" : "s"} · {h.edges.length} edge
                    {h.edges.length === 1 ? "" : "s"}
                  </span>
                </span>
                {h.idx === pointer && <span className="history-tag">Now</span>}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
