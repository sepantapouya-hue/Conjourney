import { useState } from "react";
import { ALL_TYPES, TYPE_LABEL } from "../data/seed";

const LANES = [
  { value: "merchant", label: "Merchant" },
  { value: "shopper", label: "Shopper" },
  { value: "both", label: "Cross-cutting" },
];

function emptyEvent() {
  return { type: "banner", icon: "•", title: "", subtitle: "", detail: "" };
}

export default function NodeForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    n: initial?.n ?? "+",
    lane: initial?.lane ?? "merchant",
    title: initial?.title ?? "",
    when: initial?.when ?? "",
    where: initial?.where ?? "",
    desc: initial?.desc ?? "",
    events: initial?.events ? structuredClone(initial.events) : [],
  }));

  function patch(p) {
    setForm((f) => ({ ...f, ...p }));
  }

  function patchEvent(i, p) {
    setForm((f) => ({
      ...f,
      events: f.events.map((ev, idx) => (idx === i ? { ...ev, ...p } : ev)),
    }));
  }

  function addEvent() {
    setForm((f) => ({ ...f, events: [...f.events, emptyEvent()] }));
  }

  function removeEvent(i) {
    setForm((f) => ({ ...f, events: f.events.filter((_, idx) => idx !== i) }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({ ...form, title: form.title.trim() });
  }

  return (
    <>
      <div className="scrim" onClick={onCancel} />
      <aside className="panel form">
        <div className="panel-head">
          <h2>{initial ? "Edit node" : "Add node"}</h2>
          <button type="button" className="panel-close" onClick={onCancel}>
            ×
          </button>
        </div>
        <form className="panel-body" onSubmit={submit}>
          <div className="grid-2">
            <div className="field">
              <label>ID badge</label>
              <input
                type="text"
                value={form.n}
                onChange={(e) => patch({ n: e.target.value })}
                placeholder="e.g. s0, s2.1, A8, B8"
                maxLength={8}
              />
            </div>
            <div className="field">
              <label>Lane</label>
              <select
                value={form.lane}
                onChange={(e) => patch({ lane: e.target.value })}
              >
                {LANES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="e.g. Catalog import complete"
              autoFocus
            />
          </div>

          <div className="field">
            <label>When</label>
            <input
              type="text"
              value={form.when}
              onChange={(e) => patch({ when: e.target.value })}
              placeholder="e.g. Day 0 · 0s"
            />
          </div>

          <div className="field">
            <label>Where (route or surface)</label>
            <input
              type="text"
              value={form.where}
              onChange={(e) => patch({ where: e.target.value })}
              placeholder="e.g. /train"
            />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              rows={3}
              value={form.desc}
              onChange={(e) => patch({ desc: e.target.value })}
              placeholder="One-line summary of what happens here."
            />
          </div>

          <div className="field">
            <div className="field-row">
              <label>Events</label>
              <button
                type="button"
                className="btn-ghost sm"
                onClick={addEvent}
              >
                + Add event
              </button>
            </div>
            <div className="events-edit">
              {form.events.length === 0 && (
                <div className="empty">No events yet.</div>
              )}
              {form.events.map((ev, i) => (
                <div key={i} className="event-edit">
                  <div className="grid-3">
                    <select
                      value={ev.type}
                      onChange={(e) => patchEvent(i, { type: e.target.value })}
                    >
                      {ALL_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {TYPE_LABEL[t]}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={ev.icon}
                      onChange={(e) => patchEvent(i, { icon: e.target.value })}
                      placeholder="Icon"
                      maxLength={2}
                    />
                    <button
                      type="button"
                      className="btn-ghost sm danger"
                      onClick={() => removeEvent(i)}
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    value={ev.title}
                    onChange={(e) => patchEvent(i, { title: e.target.value })}
                    placeholder="Event title"
                  />
                  <input
                    type="text"
                    value={ev.subtitle}
                    onChange={(e) =>
                      patchEvent(i, { subtitle: e.target.value })
                    }
                    placeholder="One-line subtitle"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {initial ? "Save changes" : "Create node"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
