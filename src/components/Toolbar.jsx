import { ALL_TYPES, TYPE_LABEL } from "../data/seed";

export default function Toolbar({
  viewName,
  views,
  currentViewId,
  filters,
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
          <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
            <defs>
              <linearGradient id="tg" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#7C5CFF" />
                <stop offset="1" stopColor="#36D6C5" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#tg)" />
            <path
              d="M21 11.5a6 6 0 1 0 0 9"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
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
