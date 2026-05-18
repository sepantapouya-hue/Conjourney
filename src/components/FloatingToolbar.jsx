const TOOLS = [
  {
    id: "select",
    label: "Select (V)",
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
    label: "Note (N)",
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
  {
    id: "condition",
    label: "Condition (C)",
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
        <path d="M12 2 22 12 12 22 2 12z" />
      </svg>
    ),
  },
  {
    id: "comment",
    label: "Comment (M)",
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
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 8.4 8.4 0 0 1-4-1L3 21l1-5a8.4 8.4 0 1 1 17-4.5z" />
      </svg>
    ),
  },
];

import { useState } from "react";
import ShortcutsPanel from "./ShortcutsPanel";

function IconButton({ onClick, title, disabled, children }) {
  return (
    <button
      type="button"
      className="ft-btn"
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default function FloatingToolbar({
  mode,
  onChangeMode,
  onAddNode,
  onFitView,
  onSaveView,
  onAutoLayout,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSearch,
  onHistory,
  sync,
}) {
  const [helpOpen, setHelpOpen] = useState(false);
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
        <IconButton onClick={onAddNode} title="Add stage node">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="6" width="16" height="12" rx="2" />
            <path d="M12 10v4M10 12h4" />
          </svg>
        </IconButton>
        <IconButton onClick={onAutoLayout} title="Tidy layout">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="7" height="6" rx="1.5" />
            <rect x="14" y="4" width="7" height="6" rx="1.5" />
            <rect x="3" y="14" width="7" height="6" rx="1.5" />
            <rect x="14" y="14" width="7" height="6" rx="1.5" />
          </svg>
        </IconButton>
        <IconButton onClick={onUndo} title="Undo (⌘Z)" disabled={!canUndo}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M3 13a9 9 0 1 1 4 7" />
          </svg>
        </IconButton>
        <IconButton onClick={onRedo} title="Redo (⌘⇧Z)" disabled={!canRedo}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" />
            <path d="M21 13a9 9 0 1 0-4 7" />
          </svg>
        </IconButton>
        <IconButton onClick={onHistory} title="Version history">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2.5" />
          </svg>
        </IconButton>
      </div>

      <div className="ft-sep" />

      <div className="ft-group">
        <IconButton onClick={onSearch} title="Search (⌘K)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </IconButton>
        <IconButton onClick={onFitView} title="Fit view">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
        </IconButton>
        <IconButton onClick={onSaveView} title="Save view">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <path d="M17 21v-8H7v8M7 3v5h8" />
          </svg>
        </IconButton>
      </div>

      <div className="ft-sep" />

      <div className="ft-group">
        <IconButton
          onClick={() => setHelpOpen((o) => !o)}
          title="Keyboard shortcuts"
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
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8" />
            <circle cx="12" cy="17" r="0.6" fill="currentColor" />
          </svg>
        </IconButton>
      </div>

      <div className="ft-sep" />

      <div className="ft-group ft-sync" title={sync?.tooltip || ""}>
        <span className={`ft-dot ${sync?.state || "local"}`} />
        <span className="ft-sync-label">{sync?.label || "Local"}</span>
      </div>

      {helpOpen && <ShortcutsPanel onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
