import { memo, useEffect, useRef, useState } from "react";
import { Handle, Position } from "@xyflow/react";

function ConditionNode({ id, data, selected }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.label ?? "");
  const ref = useRef(null);

  useEffect(() => {
    setDraft(data.label ?? "");
  }, [data.label]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    if (draft !== data.label) data.onChange?.(id, { label: draft });
  }

  return (
    <div className={`condition-node ${selected ? "selected" : ""}`}>
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="cn-head">
        <span className="cn-badge">
          <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2 22 12 12 22 2 12z"
              opacity="0.9"
            />
          </svg>
          Condition
        </span>
        <button
          type="button"
          className="cn-del"
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.(id);
          }}
          aria-label="Delete condition"
        >
          ×
        </button>
      </div>
      <div className="cn-body">
        {editing ? (
          <input
            ref={ref}
            className="cn-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(data.label ?? "");
                setEditing(false);
              }
            }}
          />
        ) : (
          <div
            className="cn-label"
            onDoubleClick={() => setEditing(true)}
            title="Double-click to edit"
          >
            {data.label || "Untitled condition?"}
          </div>
        )}
        {data.hint && <div className="cn-hint">{data.hint}</div>}
      </div>
      <div className="cn-foot">
        <div className="cn-branch no">
          <span className="cn-dot" />
          {data.noLabel || "No"}
        </div>
        <div className="cn-branch yes">
          {data.yesLabel || "Yes"}
          <span className="cn-dot" />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="handle handle-no"
        style={{ left: "22%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        className="handle handle-yes"
        style={{ left: "78%" }}
      />
    </div>
  );
}

export default memo(ConditionNode);
