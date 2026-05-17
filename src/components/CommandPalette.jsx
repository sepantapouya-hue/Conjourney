import { useEffect, useMemo, useRef, useState } from "react";
import { TYPE_LABEL } from "../data/seed";

function score(item, q) {
  if (!q) return 0;
  const s = (item.label + " " + (item.sub || "")).toLowerCase();
  const idx = s.indexOf(q);
  if (idx === -1) return -1;
  // Earlier match scores higher; exact label match bonus.
  return 1000 - idx + (item.label.toLowerCase().startsWith(q) ? 50 : 0);
}

export default function CommandPalette({
  nodes,
  views,
  onFocusNode,
  onOpenEvent,
  onSwitchView,
  onClose,
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef(null);

  const items = useMemo(() => {
    const out = [];
    views.forEach((v) =>
      out.push({
        kind: "view",
        id: v.id,
        label: v.name,
        sub: `View · ${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"}`,
        viewId: v.id,
      }),
    );
    nodes.forEach((n) => {
      if (n.type === "stage") {
        out.push({
          kind: "stage",
          id: n.id,
          label: n.data.title,
          sub: `Stage ${n.data.n} · ${n.data.lane}${n.data.where ? " · " + n.data.where : ""}`,
          nodeId: n.id,
        });
        (n.data.events || []).forEach((ev, i) => {
          out.push({
            kind: "event",
            id: `${n.id}-ev-${i}`,
            label: ev.title,
            sub: `${TYPE_LABEL[ev.type] || ev.type} · in "${n.data.title}"`,
            nodeId: n.id,
            event: ev,
          });
        });
      } else if (n.type === "condition") {
        out.push({
          kind: "condition",
          id: n.id,
          label: n.data.label,
          sub: "Condition node",
          nodeId: n.id,
        });
      } else if (n.type === "note") {
        const text = (n.data.text || "").trim();
        if (text) {
          out.push({
            kind: "note",
            id: n.id,
            label: text.slice(0, 60),
            sub: "Note",
            nodeId: n.id,
          });
        }
      }
    });
    return out;
  }, [nodes, views]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 40);
    return items
      .map((i) => ({ i, s: score(i, q) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map((x) => x.i);
  }, [items, query]);

  useEffect(() => setActive(0), [query]);

  // Keep active item visible
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function commit(item) {
    if (!item) return;
    if (item.kind === "view") onSwitchView(item.viewId);
    else if (item.kind === "event") onOpenEvent(item.nodeId, item.event);
    else onFocusNode(item.nodeId);
  }

  function onKey(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <>
      <div className="scrim palette-scrim" onClick={onClose} />
      <div className="palette" role="dialog" aria-label="Command palette">
        <div className="palette-search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M11 19a8 8 0 1 1 5.3-2L21 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search stages, events, views…"
            autoFocus
            spellCheck={false}
          />
          <kbd className="palette-kbd">esc</kbd>
        </div>
        <div className="palette-list" ref={listRef}>
          {results.length === 0 ? (
            <div className="palette-empty">No matches for "{query}"</div>
          ) : (
            results.map((item, i) => (
              <button
                key={item.id}
                type="button"
                data-idx={i}
                className={`palette-row kind-${item.kind} ${i === active ? "on" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => commit(item)}
              >
                <span className={`palette-tag kind-${item.kind}`}>
                  {item.kind}
                </span>
                <span className="palette-text">
                  <span className="palette-label">{item.label}</span>
                  <span className="palette-sub">{item.sub}</span>
                </span>
                <span className="palette-enter">↵</span>
              </button>
            ))
          )}
        </div>
        <div className="palette-foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>↵</kbd> select
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </>
  );
}
