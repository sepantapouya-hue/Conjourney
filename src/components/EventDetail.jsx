import { TYPE_LABEL } from "../data/seed";

export default function EventDetail({ event, stage, onClose }) {
  if (!event) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="panel detail">
        <div className="panel-head">
          <h2>Event detail</h2>
          <button type="button" className="panel-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="panel-body">
          <span className={`tag type-${event.type}`}>
            {TYPE_LABEL[event.type] || event.type}
          </span>
          <h3>{event.title}</h3>
          {stage && (
            <div className="who">
              Stage {stage.n} · {stage.when || ""} ·{" "}
              {stage.lane === "both" ? "cross-cutting" : stage.lane}
            </div>
          )}
          {event.subject && (
            <p>
              <strong>Subject:</strong> {event.subject}
            </p>
          )}
          <p>{event.detail || event.subtitle}</p>
          {event.subtitle && event.detail && (
            <p className="muted">{event.subtitle}</p>
          )}
        </div>
      </aside>
    </>
  );
}
