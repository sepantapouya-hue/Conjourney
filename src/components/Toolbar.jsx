import { ALL_TYPES, TYPE_LABEL } from "../data/seed";
import Logo from "./Logo";

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
