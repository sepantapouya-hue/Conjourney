import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

function Switch({ label, value, on }) {
  return (
    <div className={`ms-sw ${on ? "on" : "off"}`}>
      <span className="ms-sw-label">{label}</span>
      <span className="ms-sw-value">{value}</span>
    </div>
  );
}

function MerchantStateNode({ data, selected }) {
  const reason = (data.reason || "NONE").toUpperCase();
  const phase = data.stateId?.[0]; // "A" or "B"
  return (
    <div
      className={`state-node phase-${phase} reason-${reason.toLowerCase()} ${
        selected ? "selected" : ""
      }`}
    >
      <Handle type="target" position={Position.Top} className="handle" />

      <div className="ms-head">
        <span className="ms-id">{data.stateId}</span>
        <span className="ms-title">{data.title}</span>
      </div>

      <div className="ms-switches">
        <Switch
          label="Plan"
          value={data.plan === "paid" ? "PAID" : "FREE"}
          on={data.plan === "paid"}
        />
        <Switch
          label="Widget"
          value={data.widget ? "ON" : "OFF"}
          on={data.widget}
        />
        <Switch
          label="Embed"
          value={data.embed ? "ON" : "OFF"}
          on={data.embed}
        />
        <Switch
          label="Convs"
          value={data.hasConvos ? "≥1" : "0"}
          on={data.hasConvos}
        />
      </div>

      <div className="ms-meta">
        <span className="ms-meta-key">Home</span>
        <span className="ms-meta-val">{data.home}</span>
        {data.activation && (
          <>
            <span className="ms-meta-key">Activation</span>
            <span className="ms-meta-val mono">{data.activation}</span>
          </>
        )}
      </div>

      {data.summary && <p className="ms-summary">{data.summary}</p>}

      {Array.isArray(data.onScreen) && data.onScreen.length > 0 && (
        <div className="ms-section">
          <div className="ms-section-h">On screen</div>
          <ul className="ms-list">
            {data.onScreen.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(data.emails) && data.emails.length > 0 && (
        <div className="ms-section">
          <div className="ms-section-h">Emails</div>
          <ul className="ms-list emails">
            {data.emails.map((line, i) => (
              <li key={i}>✉ {line}</li>
            ))}
          </ul>
        </div>
      )}

      {data.next && (
        <div className="ms-next">
          <span className="ms-next-arrow">→</span> {data.next}
        </div>
      )}

      <div className="ms-foot">
        <span className={`ms-reason r-${reason.toLowerCase()}`}>
          {reason === "NONE" ? "🟢 Live" : `Blocked · ${reason}`}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}

export default memo(MerchantStateNode);
