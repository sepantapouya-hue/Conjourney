import { memo, useEffect, useRef, useState } from "react";
import { Handle, Position } from "@xyflow/react";

function HeaderNode({ id, data, selected }) {
  const [editingField, setEditingField] = useState(null); // 'title' | 'subtitle' | null
  const [titleDraft, setTitleDraft] = useState(data.title || "");
  const [subDraft, setSubDraft] = useState(data.subtitle || "");
  const ref = useRef(null);

  useEffect(() => setTitleDraft(data.title || ""), [data.title]);
  useEffect(() => setSubDraft(data.subtitle || ""), [data.subtitle]);

  useEffect(() => {
    if (editingField && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editingField]);

  function commit() {
    if (editingField === "title") {
      if (titleDraft !== data.title) data.onChange?.(id, { title: titleDraft });
    } else if (editingField === "subtitle") {
      if (subDraft !== data.subtitle)
        data.onChange?.(id, { subtitle: subDraft });
    }
    setEditingField(null);
  }

  return (
    <div
      className={`header-node tone-${data.tone || "primary"} ${selected ? "selected" : ""}`}
    >
      <Handle type="target" position={Position.Top} className="handle" />
      <div className="hn-body">
        {data.kicker && <div className="hn-kicker">{data.kicker}</div>}
        {editingField === "title" ? (
          <input
            ref={ref}
            className="hn-title-input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setTitleDraft(data.title || "");
                setEditingField(null);
              }
            }}
          />
        ) : (
          <h2
            className="hn-title"
            onDoubleClick={() => setEditingField("title")}
            title="Double-click to edit"
          >
            {data.title || "Untitled section"}
          </h2>
        )}
        {editingField === "subtitle" ? (
          <input
            ref={ref}
            className="hn-subtitle-input"
            value={subDraft}
            onChange={(e) => setSubDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setSubDraft(data.subtitle || "");
                setEditingField(null);
              }
            }}
          />
        ) : (
          <p
            className="hn-subtitle"
            onDoubleClick={() => setEditingField("subtitle")}
            title="Double-click to edit"
          >
            {data.subtitle || "Double-click to add a subtitle"}
          </p>
        )}
      </div>
      <button
        type="button"
        className="hn-del"
        onClick={(e) => {
          e.stopPropagation();
          data.onDelete?.(id);
        }}
        aria-label="Delete header"
      >
        ×
      </button>
      <Handle type="source" position={Position.Bottom} className="handle" />
    </div>
  );
}

export default memo(HeaderNode);
