import { ALL_TYPES, TYPE_LABEL } from "../data/seed";
import Logo from "./Logo";

export default function Toolbar({
  viewName,
  views,
  currentViewId,
  filters,
  mode,
  onChangeMode,
  onChangeView,
  onAddNode,
  onOpenViews,
  onSaveView,
  onLogout,
  onToggleFilter,
  onFitView,
}) {
  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <div className="brand">
          <Logo size={28} />
          <div className="brand-text">
            <div className="brand-name">Conjourney</div>
            <div className="brand-sub">Convi user journey</div>
          </div>
        </div>

        <div className="view-switcher">
          <select
            value={currentViewId}
            onChange={(e) => onChangeView(e.target.value)}
            aria-label="Switch view"
          >
            {views.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
          <button type="button" className="btn-ghost" onClick={onOpenViews}>
            Manage views
          </button>
        </div>
      </div>

      <div className="toolbar-mid">
        <div className="filters">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={`filter-chip type-${t} ${filters[t] ? "on" : "off"}`}
              onClick={() => onToggleFilter(t)}
              aria-pressed={filters[t]}
              title={`Toggle ${TYPE_LABEL[t]}`}
            >
              <span className={`dot type-${t}`} />
              {TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-right">
        <div className="mode-toggle" role="group" aria-label="Canvas mode">
          <button
            type="button"
            className={`mode-btn ${mode === "select" ? "on" : ""}`}
            onClick={() => onChangeMode("select")}
            title="Select mode (V)"
            aria-pressed={mode === "select"}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M5.5 3.5 19 12l-6.6.8-2.2 6.5z"
              />
            </svg>
            <span>V</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === "hand" ? "on" : ""}`}
            onClick={() => onChangeMode("hand")}
            title="Hand mode (H)"
            aria-pressed={mode === "hand"}
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
              <path d="M7 11V6a1.5 1.5 0 1 1 3 0v5" />
              <path d="M10 10V4a1.5 1.5 0 1 1 3 0v6" />
              <path d="M13 10V5a1.5 1.5 0 1 1 3 0v6" />
              <path d="M16 11V8a1.5 1.5 0 1 1 3 0v7c0 4-2.7 7-7 7s-7-3-7-7v-3c0-1.5 1.6-2 2.6-1.1l1.4 1.1" />
            </svg>
            <span>H</span>
          </button>
        </div>
        <button type="button" className="btn-ghost" onClick={onFitView}>
          Fit view
        </button>
        <button type="button" className="btn-primary" onClick={onAddNode}>
          + Add node
        </button>
        <button type="button" className="btn-ghost" onClick={onSaveView}>
          Save view
        </button>
        <button type="button" className="btn-ghost logout" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </header>
  );
}
