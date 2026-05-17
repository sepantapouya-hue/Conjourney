import { memo, useState, useRef, useEffect } from "react";
import { NodeResizer } from "@xyflow/react";

function NoteNode({ id, data, selected }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.text ?? "");
  const ref = useRef(null);

  useEffect(() => {
    setDraft(data.text ?? "");
  }, [data.text]);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    if (draft !== data.text) data.onChange?.(id, { text: draft });
  }

  return (
    <div className={`note-node color-${data.color || "amber"} ${selected ? "selected" : ""}`}>
      <NodeResizer
        minWidth={160}
        minHeight={100}
        isVisible={selected}
        lineClassName="note-resize-line"
        handleClassName="note-resize-handle"
      />
      <div className="note-head">
        <div className="note-dots">
          {["amber", "rose", "violet", "teal"].map((c) => (
            <button
              key={c}
              type="button"
              className={`note-dot color-${c} ${
                (data.color || "amber") === c ? "on" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                data.onChange?.(id, { color: c });
              }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
        <button
          type="button"
          className="note-del"
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.(id);
          }}
          aria-label="Delete note"
        >
          ×
        </button>
      </div>
      {editing ? (
        <textarea
          ref={ref}
          className="note-text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              setDraft(data.text ?? "");
              setEditing(false);
            }
          }}
          placeholder="Write a note…"
        />
      ) : (
        <div
          className="note-text view"
          onDoubleClick={() => setEditing(true)}
        >
          {data.text?.trim()
            ? data.text
            : "Double-click to write a note…"}
        </div>
      )}
    </div>
  );
}

export default memo(NoteNode);
