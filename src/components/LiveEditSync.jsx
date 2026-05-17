import { useEffect, useRef } from "react";
import { useBroadcastEvent, useEventListener } from "@liveblocks/react";

// Realtime edit broadcaster. Mounted only inside the Liveblocks
// RoomProvider tree (i.e. when presenceEnabled is true).
//
// - On every change to nodes / edges / filters, debounces 250 ms and
//   broadcasts a single "state" event with the full payload.
// - On every incoming "state" event from another peer, replaces local
//   state. A ref-based guard prevents the resulting re-render from
//   triggering an outbound broadcast (which would loop).
//
// This is a simple last-write-wins model. Good enough for a small team
// editing the same map together. For full multi-cursor CRDT editing
// you'd migrate to Liveblocks Storage (LiveObject + LiveList).

export default function LiveEditSync({
  nodes,
  edges,
  filters,
  currentViewId,
  onRemotePatch,
}) {
  const broadcast = useBroadcastEvent();
  const fromRemote = useRef(false);
  const lastSent = useRef("");

  // Receive remote patches
  useEventListener(({ event }) => {
    if (!event || event.type !== "state") return;
    if (event.viewId !== currentViewId) return; // ignore other views
    fromRemote.current = true;
    onRemotePatch(event.nodes, event.edges, event.filters);
  });

  // Send local changes (debounced 250 ms, dedup by serialized payload)
  useEffect(() => {
    if (fromRemote.current) {
      fromRemote.current = false;
      return;
    }
    const payload = JSON.stringify({ nodes, edges, filters, currentViewId });
    if (payload === lastSent.current) return;

    const t = setTimeout(() => {
      lastSent.current = payload;
      broadcast({
        type: "state",
        viewId: currentViewId,
        nodes,
        edges,
        filters,
      });
    }, 250);
    return () => clearTimeout(t);
  }, [nodes, edges, filters, currentViewId, broadcast]);

  return null;
}
