import { useEffect, useRef } from "react";
import { useOthers, useUpdateMyPresence, useSelf } from "@liveblocks/react";
import { useReactFlow, ViewportPortal } from "@xyflow/react";
import { initials } from "../lib/presence";

// === LiveCursors — renders other users' cursors inside the flow viewport ===
export function LiveCursors() {
  const others = useOthers();
  return (
    <ViewportPortal>
      {others.map(({ connectionId, presence }) => {
        if (!presence?.cursor) return null;
        const color = presence.user?.color || "#7d71fe";
        const name = presence.user?.name || "Anon";
        return (
          <div
            key={connectionId}
            className="live-cursor"
            style={{
              transform: `translate(${presence.cursor.x}px, ${presence.cursor.y}px)`,
            }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M5 3l14 8-6 1.5-2 6z"
                fill={color}
                stroke="#fff"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="live-cursor-name"
              style={{ background: color }}
            >
              {name}
            </span>
          </div>
        );
      })}
    </ViewportPortal>
  );
}

// === PresenceTracker — pushes our cursor / view / mode into Liveblocks ====
export function PresenceTracker({ canvasRef, viewId, viewName, mode }) {
  const updatePresence = useUpdateMyPresence();
  const rf = useReactFlow();
  const lastSent = useRef(0);

  // Update viewId/viewName/mode whenever they change
  useEffect(() => {
    updatePresence({ viewId, viewName, mode });
  }, [viewId, viewName, mode, updatePresence]);

  // Track pointer position on the canvas in flow coordinates
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    function onMove(e) {
      const now = performance.now();
      if (now - lastSent.current < 50) return; // throttle further (Liveblocks also throttles)
      lastSent.current = now;
      const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      updatePresence({ cursor: { x: pos.x, y: pos.y } });
    }
    function onLeave() {
      updatePresence({ cursor: null });
    }
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [canvasRef, rf, updatePresence]);

  return null;
}

// === PresenceCluster — avatar bubbles for the toolbar ====================
export function PresenceCluster() {
  const self = useSelf();
  const others = useOthers();
  const all = self ? [{ self: true, ...self }, ...others] : others;
  if (all.length === 0) return null;

  return (
    <div className="presence-cluster" title={`${all.length} online`}>
      {all.slice(0, 5).map((p, i) => {
        const u = p.presence?.user || {};
        const color = u.color || "#94a3b8";
        const name = u.name || "Anon";
        const viewName = p.presence?.viewName || "";
        const tip = p.self
          ? `${name} (you)${viewName ? " · " + viewName : ""}`
          : `${name}${viewName ? " · viewing " + viewName : ""}`;
        return (
          <span
            key={p.connectionId ?? "self"}
            className={`presence-avatar ${p.self ? "self" : ""}`}
            style={{ background: color, zIndex: 20 - i }}
            title={tip}
          >
            {initials(name)}
          </span>
        );
      })}
      {all.length > 5 && (
        <span className="presence-avatar more" title={`${all.length - 5} more online`}>
          +{all.length - 5}
        </span>
      )}
    </div>
  );
}
