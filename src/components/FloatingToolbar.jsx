const TOOLS = [
  {
    id: "select",
    label: "Select (V)",
    shortcut: "V",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="currentColor"
          d="M5.5 3.5 19 12l-6.6.8-2.2 6.5z"
        />
      </svg>
    ),
  },
  {
    id: "hand",
    label: "Hand (H)",
    shortcut: "H",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 11V6a1.5 1.5 0 1 1 3 0v5" />
        <path d="M10 10V4a1.5 1.5 0 1 1 3 0v6" />
        <path d="M13 10V5a1.5 1.5 0 1 1 3 0v6" />
        <path d="M16 11V8a1.5 1.5 0 1 1 3 0v7c0 4-2.7 7-7 7s-7-3-7-7v-3c0-1.5 1.6-2 2.6-1.1l1.4 1.1" />
      </svg>
    ),
  },
  {
    id: "note",
    label: "Note (N) — click canvas to drop",
    shortcut: "N",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8z" />
        <path d="M14 3v6h6" />
        <path d="M8 13h7" />
        <path d="M8 17h5" />
      </svg>
    ),
  },
];

export default function FloatingToolbar({
  mode,
  onChangeMode,
  onAddNode,
  onFitView,
  onSaveView,
  sync,
}) {
  return (
    <div className="floating-toolbar" role="toolbar" aria-label="Canvas tools">
      <div className="ft-group">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`ft-btn ${mode === t.id ? "on" : ""}`}
            onClick={() => onChangeMode(t.id)}
            title={t.label}
            aria-pressed={mode === t.id}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="ft-sep" />

      <div className="ft-group">
        <button
          type="button"
          className="ft-btn"
          onClick={onAddNode}
          title="Add stage node"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="6" width="16" height="12" rx="2" />
            <path d="M12 10v4M10 12h4" />
          </svg>
        </button>
        <button
          type="button"
          className="ft-btn"
          onClick={onFitView}
          title="Fit view"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
        </button>
        <button
          type="button"
          className="ft-btn"
          onClick={onSaveView}
          title="Save view"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <path d="M17 21v-8H7v8M7 3v5h8" />
          </svg>
        </button>
      </div>

      <div className="ft-sep" />

      <div className="ft-group ft-sync" title={sync?.tooltip || ""}>
        <span className={`ft-dot ${sync?.state || "local"}`} />
        <span className="ft-sync-label">{sync?.label || "Local"}</span>
      </div>
    </div>
  );
}
