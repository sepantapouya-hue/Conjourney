import { ALL_TYPES } from "../data/seed";
import Logo from "./Logo";
import FiltersPopover from "./FiltersPopover";
import { PresenceCluster } from "./LivePresence";
import { presenceEnabled } from "./PresenceProvider";

export default function Toolbar({
  views,
  currentViewId,
  filters,
  onChangeView,
  onOpenViews,
  onSaveView,
  onLogout,
  onToggleFilter,
  onFiltersAll,
  onFiltersNone,
  theme,
  onToggleTheme,
  isDirty,
}) {
  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <div className="brand">
          <Logo size={26} />
          <span className="brand-name">Conjourney</span>
        </div>

        <span className="toolbar-sep" />

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
          <button
            type="button"
            className="icon-btn"
            onClick={onOpenViews}
            title="Manage views"
            aria-label="Manage views"
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
              <rect x="3" y="4" width="18" height="4" rx="1" />
              <rect x="3" y="10" width="18" height="4" rx="1" />
              <rect x="3" y="16" width="18" height="4" rx="1" />
            </svg>
          </button>
        </div>

        {isDirty && (
          <span
            className="unsaved-badge"
            title="You have unsaved changes — click Save changes to push them to the shared backend."
          >
            Unsaved
          </span>
        )}
      </div>

      <div className="toolbar-mid">
        <FiltersPopover
          filters={filters}
          onToggle={onToggleFilter}
          onAll={onFiltersAll}
          onNone={onFiltersNone}
        />
      </div>

      <div className="toolbar-right">
        {presenceEnabled && <PresenceCluster />}

        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
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
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          className={isDirty ? "btn-primary save-btn" : "btn-ghost save-btn"}
          onClick={onSaveView}
          title={isDirty ? "Save unsaved changes" : "Re-save current view"}
        >
          {isDirty ? "Save changes" : "Save view"}
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={onLogout}
          title="Sign out"
          aria-label="Sign out"
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
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          </svg>
        </button>
      </div>
    </header>
  );
}
