import { useEffect, useRef } from "react";

const ICONS = {
  edit: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4z" />
      <path d="M5 21h14" />
    </svg>
  ),
  duplicate: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <rect x="4" y="4" width="12" height="12" rx="2" />
    </svg>
  ),
  delete: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  ),
  bringFront: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="14" height="14" rx="2" />
      <rect x="3" y="3" width="14" height="14" rx="2" />
    </svg>
  ),
  resolve: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  reopen: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 4-7" />
      <path d="M3 5v7h7" />
    </svg>
  ),
  note: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8z" />
      <path d="M14 3v6h6" />
    </svg>
  ),
  json: (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 9v6M16 9v6M8 12h2M14 12h2" />
    </svg>
  ),
};

export default function NodeContextMenu({ menu, onClose, onAction }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!menu) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    function onAnywhere(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onAnywhere);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onAnywhere);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  return (
    <div
      ref={ref}
      className="ctx-menu"
      style={{ top: menu.y, left: menu.x }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="ctx-head">
        <span className="ctx-kind">{menu.nodeKind}</span>
        {menu.label && <span className="ctx-label">{menu.label}</span>}
      </div>
      <div className="ctx-list">
        {menu.items.map((item, i) => {
          if (item.divider) {
            return <div key={`d-${i}`} className="ctx-divider" />;
          }
          return (
            <button
              key={item.id}
              type="button"
              className={`ctx-item ${item.danger ? "danger" : ""}`}
              onClick={() => onAction(item.id)}
            >
              <span className="ctx-ico">{ICONS[item.icon] ?? null}</span>
              <span className="ctx-text">{item.label}</span>
              {item.shortcut && (
                <span className="ctx-shortcut">{item.shortcut}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
