import { ALL_TYPES, TYPE_LABEL } from "../data/seed";
import Logo from "./Logo";
import { PresenceCluster } from "./LivePresence";
import { presenceEnabled } from "./PresenceProvider";

export default function Toolbar({
  views,
  currentViewId,
  filters,
  onChangeView,
  onAddNode,
  onOpenViews,
  onSaveView,
  onLogout,
  onToggleFilter,
  theme,
  onToggleTheme,
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
        {presenceEnabled && <PresenceCluster />}
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <circle cx="12" cy="12" r="4" fill="currentColor" />
              <g
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
              >
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m4.9 4.9 1.4 1.4" />
                <path d="m17.7 17.7 1.4 1.4" />
                <path d="m4.9 19.1 1.4-1.4" />
                <path d="m17.7 6.3 1.4-1.4" />
              </g>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
                fill="currentColor"
              />
            </svg>
          )}
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
