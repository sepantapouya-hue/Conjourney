import { useState } from "react";

export default function ViewsPanel({
  views,
  currentViewId,
  onClose,
  onSelect,
  onCreate,
  onDuplicate,
  onRename,
  onDelete,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");

  function startRename(v) {
    setEditingId(v.id);
    setDraft(v.name);
  }

  function commitRename(id) {
    if (draft.trim()) onRename(id, draft.trim());
    setEditingId(null);
  }

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="panel views">
        <div className="panel-head">
          <h2>Views</h2>
          <button type="button" className="panel-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="panel-body">
          <button
            type="button"
            className="btn-primary block"
            onClick={onCreate}
          >
            + New blank view
          </button>
          <div className="view-list">
            {views.map((v) => (
              <div
                key={v.id}
                className={`view-row ${v.id === currentViewId ? "current" : ""}`}
              >
                <div className="view-row-main">
                  {editingId === v.id ? (
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => commitRename(v.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(v.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      className="view-name"
                      onClick={() => onSelect(v.id)}
                    >
                      {v.name}
                      {v.id === currentViewId && (
                        <span className="badge-current">Current</span>
                      )}
                    </button>
                  )}
                  <div className="view-meta">
                    {v.nodes.length} node{v.nodes.length === 1 ? "" : "s"} · {" "}
                    {v.edges.length} edge{v.edges.length === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="view-row-actions">
                  <button
                    type="button"
                    className="btn-ghost sm"
                    onClick={() => startRename(v)}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="btn-ghost sm"
                    onClick={() => onDuplicate(v.id)}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="btn-ghost sm danger"
                    onClick={() => onDelete(v.id)}
                    disabled={views.length === 1}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
