import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { TYPE_LABEL } from "../data/seed";

function StageNode({ data, selected }) {
  const filters = data.filters || {};
  const events = data.events || [];

  return (
    <div className={`stage-node lane-${data.lane} ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="sn-head">
        <div className="sn-row">
          <span className="sn-num">{data.n}</span>
          <span className={`sn-lane pill-${data.lane}`}>
            {data.lane === "both" ? "cross" : data.lane}
          </span>
          {data.when && <span className="sn-when">{data.when}</span>}
        </div>
        <div className="sn-title">{data.title}</div>
        {data.where && <div className="sn-where">{data.where}</div>}
      </div>
      {data.desc && <div className="sn-desc">{data.desc}</div>}
      {events.length > 0 && (
        <div className="sn-events">
          {events.map((ev, i) => {
            const dim = filters[ev.type] === false;
            return (
              <div
                key={i}
                className={`sn-event type-${ev.type} ${dim ? "dim" : ""}`}
                title={`${TYPE_LABEL[ev.type] || ev.type} — ${ev.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  data.onEventClick?.(ev, data);
                }}
              >
                <span className="sn-ev-ico">{ev.icon}</span>
                <span className="sn-ev-title">{ev.title}</span>
                <span className="sn-ev-tag">{TYPE_LABEL[ev.type] || ev.type}</span>
              </div>
            );
          })}
        </div>
      )}
      <div className="sn-actions">
        <button
          type="button"
          className="sn-action"
          onClick={(e) => {
            e.stopPropagation();
            data.onEdit?.(data);
          }}
        >
          Edit
        </button>
        <button
          type="button"
          className="sn-action danger"
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.(data);
          }}
        >
          Delete
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}

export default memo(StageNode);
