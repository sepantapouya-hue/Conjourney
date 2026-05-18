import { useEffect, useRef, useState } from "react";
import { ALL_TYPES, TYPE_LABEL } from "../data/seed";

export default function FiltersPopover({ filters, onToggle, onAll, onNone }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const total = ALL_TYPES.length;
  const active = ALL_TYPES.filter((t) => filters[t]).length;

  useEffect(() => {
    if (!open) return;
    function onAnywhere(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onAnywhere);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onAnywhere);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="filters-wrap" ref={ref}>
      <button
        type="button"
        className={`filters-trigger ${active < total ? "filtered" : ""}`}
        onClick={() => setOpen((o) => !o)}
        title="Filter event types"
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 5h18M6 12h12M10 19h4" />
        </svg>
        Filters
        <span className="filters-count">
          {active === total ? "All" : `${active}/${total}`}
        </span>
      </button>
      {open && (
        <div className="filters-popover" role="dialog">
          <div className="filters-head">
            <span>Event types</span>
            <div className="filters-bulk">
              <button
                type="button"
                className="btn-ghost xs"
                onClick={onAll}
              >
                All
              </button>
              <button
                type="button"
                className="btn-ghost xs"
                onClick={onNone}
              >
                None
              </button>
            </div>
          </div>
          <div className="filters-grid">
            {ALL_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`filter-chip type-${t} ${filters[t] ? "on" : "off"}`}
                onClick={() => onToggle(t)}
                aria-pressed={filters[t]}
              >
                <span className={`dot type-${t}`} />
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
