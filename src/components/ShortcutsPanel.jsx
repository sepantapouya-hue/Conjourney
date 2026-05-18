import { useEffect, useRef } from "react";

const GROUPS = [
  {
    title: "Tools",
    rows: [
      ["V", "Select"],
      ["H", "Hand · pan canvas"],
      ["N", "Note"],
      ["C", "Condition"],
      ["M", "Comment"],
    ],
  },
  {
    title: "Actions",
    rows: [
      ["⌘K", "Search / jump to anything"],
      ["⌘Z", "Undo"],
      ["⌘⇧Z", "Redo"],
      ["+ / −", "Zoom in / out"],
    ],
  },
  {
    title: "Canvas",
    rows: [
      ["Two-finger drag", "Pan"],
      ["Pinch / scroll", "Zoom"],
      ["Click edge", "Insert node between"],
      ["Right-click", "Open context menu"],
      ["⌘ + Enter (note)", "Save"],
    ],
  },
];

export default function ShortcutsPanel({ onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function onAnywhere(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onAnywhere);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onAnywhere);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="shortcuts-panel" ref={ref}>
      <div className="shortcuts-head">
        <span>Keyboard shortcuts</span>
        <button
          type="button"
          className="shortcuts-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="shortcuts-body">
        {GROUPS.map((g) => (
          <div key={g.title} className="shortcuts-group">
            <div className="shortcuts-group-h">{g.title}</div>
            <div className="shortcuts-rows">
              {g.rows.map(([key, label]) => (
                <div key={key} className="shortcuts-row">
                  <kbd>{key}</kbd>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
