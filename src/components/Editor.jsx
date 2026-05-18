import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import StageNode from "./StageNode";
import NoteNode from "./NoteNode";
import ConditionNode from "./ConditionNode";
import MerchantStateNode from "./MerchantStateNode";
import HeaderNode from "./HeaderNode";
import CommentNode from "./CommentNode";
import NodeContextMenu from "./NodeContextMenu";
import { getIdentity } from "../lib/presence";
import { LiveCursors, PresenceTracker } from "./LivePresence";
import { presenceEnabled } from "./PresenceProvider";
import LiveEditSync from "./LiveEditSync";
import Toolbar from "./Toolbar";
import ViewsPanel from "./ViewsPanel";
import NodeForm from "./NodeForm";
import EventDetail from "./EventDetail";
import FloatingToolbar from "./FloatingToolbar";
import CommandPalette from "./CommandPalette";
import HistoryPanel from "./HistoryPanel";
import {
  initialNodes,
  initialEdges,
  defaultFilters,
  LAYOUT,
  INITIAL_VIEWS,
} from "../data/seed";
import {
  loadLocal,
  saveLocal,
  fetchRemoteViews,
  pushRemoteViews,
} from "../lib/viewsApi";

const CURRENT_KEY = "conjourney_current_v2";
const HISTORY_MAX = 50;

function makeDefaultViews() {
  // Clone so that resetting later doesn't mutate the canonical objects.
  return INITIAL_VIEWS.map((v) => ({
    ...v,
    nodes: v.nodes.map((n) => ({ ...n, position: { ...n.position }, data: { ...n.data } })),
    edges: v.edges.map((e) => ({ ...e })),
    filters: { ...v.filters },
  }));
}

function uid(prefix = "n") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}

function EditorInner({ onLogout, theme, onToggleTheme }) {
  const [views, setViews] = useState(() => {
    const local = loadLocal();
    if (Array.isArray(local) && local.length) return local;
    return makeDefaultViews();
  });
  const [currentViewId, setCurrentViewId] = useState(() => {
    return localStorage.getItem(CURRENT_KEY) || "merchant";
  });

  const [sync, setSync] = useState({ state: "loading", label: "Syncing…" });

  const currentView =
    views.find((v) => v.id === currentViewId) || views[0];

  const [nodes, setNodes, onNodesChange] = useNodesState(currentView.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentView.edges);
  const [filters, setFilters] = useState(currentView.filters);

  const [showViews, setShowViews] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [toast, setToast] = useState(null);
  const [mode, setMode] = useState("select");
  const [isConnecting, setIsConnecting] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  // Undo / redo history (in-memory, per session)
  const [history, setHistory] = useState([]);
  const [pointer, setPointer] = useState(-1);
  const restoringRef = useRef(false);

  const skipReloadRef = useRef(false);
  const canvasRef = useRef(null);
  const rf = useReactFlow();

  function flashToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  // Take a snapshot. Called after every meaningful edit.
  const pushSnapshot = useCallback(
    (nextNodes, nextEdges, nextFilters, label) => {
      if (restoringRef.current) {
        restoringRef.current = false;
        return;
      }
      setHistory((h) => {
        const trimmed = h.slice(0, pointer + 1);
        const next = [
          ...trimmed,
          {
            nodes: nextNodes,
            edges: nextEdges,
            filters: nextFilters,
            label: label || "Edit",
            at: Date.now(),
          },
        ];
        return next.slice(-HISTORY_MAX);
      });
      setPointer((p) =>
        Math.min(Math.min(p + 1, HISTORY_MAX - 1), HISTORY_MAX - 1),
      );
    },
    [pointer],
  );

  // Apply a snapshot index without writing a new history entry
  function restore(idx) {
    if (idx < 0 || idx >= history.length) return;
    const snap = history[idx];
    restoringRef.current = true;
    setNodes(snap.nodes);
    setEdges(snap.edges);
    setFilters(snap.filters);
    setPointer(idx);
  }

  function undo() {
    if (pointer <= 0) return;
    const target = history[pointer - 1];
    restoringRef.current = true;
    setNodes(target.nodes);
    setEdges(target.edges);
    setFilters(target.filters);
    setPointer(pointer - 1);
    flashToast(`Undid — ${history[pointer].label}`);
  }

  function redo() {
    if (pointer >= history.length - 1) return;
    const target = history[pointer + 1];
    restoringRef.current = true;
    setNodes(target.nodes);
    setEdges(target.edges);
    setFilters(target.filters);
    setPointer(pointer + 1);
    flashToast(`Redid — ${target.label}`);
  }

  // Seed the history with the initial state when the view first loads
  useEffect(() => {
    if (history.length === 0) {
      setHistory([
        {
          nodes,
          edges,
          filters,
          label: `Opened "${currentView.name}"`,
          at: Date.now(),
        },
      ]);
      setPointer(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Initial remote fetch -------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    fetchRemoteViews().then((res) => {
      if (cancelled) return;
      if (res.ok && Array.isArray(res.views) && res.views.length) {
        skipReloadRef.current = true;
        setViews(res.views);
        const target =
          res.views.find((v) => v.id === currentViewId) || res.views[0];
        setCurrentViewId(target.id);
        setNodes(target.nodes);
        setEdges(target.edges);
        setFilters(target.filters || defaultFilters());
        setSync({
          state: "remote",
          label: "Shared",
          tooltip: "Synced with the shared backend",
        });
        setTimeout(() => rf.fitView({ padding: 0.18, duration: 200 }), 80);
      } else if (res.ok) {
        setSync({
          state: "remote",
          label: "Shared",
          tooltip: "Connected to shared backend (no views saved yet)",
        });
      } else if (res.configured === false) {
        setSync({
          state: "local",
          label: "Local only",
          tooltip:
            "Shared backend (Vercel KV) is not connected. Views are kept in this browser only — see README.",
        });
      } else {
        setSync({
          state: "offline",
          label: "Offline",
          tooltip: "Couldn't reach the backend. Changes stay in this browser.",
        });
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => saveLocal(views), [views]);
  useEffect(() => {
    localStorage.setItem(CURRENT_KEY, currentViewId);
  }, [currentViewId]);

  // When switching view, reload its nodes/edges/filters
  useEffect(() => {
    if (skipReloadRef.current) {
      skipReloadRef.current = false;
      return;
    }
    const v = views.find((x) => x.id === currentViewId);
    if (!v) return;
    restoringRef.current = true;
    setNodes(v.nodes);
    setEdges(v.edges);
    setFilters(v.filters || defaultFilters());
    setTimeout(() => rf.fitView({ padding: 0.18, duration: 300 }), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentViewId]);

  // --- Keyboard shortcuts ---------------------------------------------------
  useEffect(() => {
    function onKey(e) {
      const t = e.target;
      const editable =
        t?.tagName === "INPUT" ||
        t?.tagName === "TEXTAREA" ||
        t?.tagName === "SELECT" ||
        t?.isContentEditable;

      // Cmd+K / Ctrl+K — palette (works even inside inputs)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowPalette((s) => !s);
        return;
      }

      // Cmd+Z / Ctrl+Z — undo. Cmd+Shift+Z or Cmd+Y — redo.
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        if (editable) return;
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        if (editable) return;
        e.preventDefault();
        redo();
        return;
      }

      if (editable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        rf.zoomIn({ duration: 150 });
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        rf.zoomOut({ duration: 150 });
      } else if (e.key === "h" || e.key === "H") {
        setMode("hand");
        flashToast("Hand mode — drag the canvas to pan");
      } else if (e.key === "v" || e.key === "V") {
        setMode("select");
        flashToast("Select mode");
      } else if (e.key === "n" || e.key === "N") {
        setMode("note");
        flashToast("Note mode — click anywhere on the canvas");
      } else if (e.key === "c" || e.key === "C") {
        setMode("condition");
        flashToast("Condition mode — click canvas to drop a decision");
      } else if (e.key === "m" || e.key === "M") {
        setMode("comment");
        flashToast("Comment mode — click canvas to drop a comment");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rf, pointer, history]);

  // --- Node event handlers --------------------------------------------------
  const onEventClick = useCallback((event, stage) => {
    setActiveEvent(event);
    setActiveStage(stage);
  }, []);

  const onDeleteStage = useCallback(
    (stage) => {
      const id = String(stage.nodeId);
      if (!id) return;
      const nextNodes = nodes.filter((n) => n.id !== id);
      const nextEdges = edges.filter(
        (e) => e.source !== id && e.target !== id,
      );
      setNodes(nextNodes);
      setEdges(nextEdges);
      pushSnapshot(nextNodes, nextEdges, filters, "Deleted node");
    },
    [nodes, edges, filters, setNodes, setEdges, pushSnapshot],
  );

  const onNoteChange = useCallback(
    (id, patch) => {
      const nextNodes = nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
      );
      setNodes(nextNodes);
      pushSnapshot(nextNodes, edges, filters, "Edited note");
    },
    [nodes, edges, filters, setNodes, pushSnapshot],
  );

  const onNoteDelete = useCallback(
    (id) => {
      const nextNodes = nodes.filter((n) => n.id !== id);
      const nextEdges = edges.filter(
        (e) => e.source !== id && e.target !== id,
      );
      setNodes(nextNodes);
      setEdges(nextEdges);
      pushSnapshot(nextNodes, nextEdges, filters, "Deleted note");
    },
    [nodes, edges, filters, setNodes, setEdges, pushSnapshot],
  );

  const onConditionChange = onNoteChange;
  const onConditionDelete = onNoteDelete;

  useEffect(() => {
    if (editingId == null) return;
    setShowForm(true);
  }, [editingId]);

  const renderedNodes = useMemo(() => {
    return nodes.map((n) => {
      if (n.type === "note") {
        return {
          ...n,
          data: { ...n.data, onChange: onNoteChange, onDelete: onNoteDelete },
        };
      }
      if (n.type === "condition") {
        return {
          ...n,
          data: {
            ...n.data,
            onChange: onConditionChange,
            onDelete: onConditionDelete,
          },
        };
      }
      if (n.type === "header") {
        return {
          ...n,
          data: {
            ...n.data,
            onChange: onNoteChange,
            onDelete: onNoteDelete,
          },
        };
      }
      if (n.type === "comment") {
        return {
          ...n,
          data: {
            ...n.data,
            onChange: onNoteChange,
            onDelete: onNoteDelete,
          },
        };
      }
      return {
        ...n,
        data: {
          ...n.data,
          nodeId: n.id,
          filters,
          onEventClick,
          onEdit: (stage) => setEditingId(String(stage.nodeId ?? n.id)),
          onDelete: (stage) => onDeleteStage({ ...stage, nodeId: n.id }),
        },
      };
    });
  }, [
    nodes,
    filters,
    onEventClick,
    onDeleteStage,
    onNoteChange,
    onNoteDelete,
    onConditionChange,
    onConditionDelete,
  ]);

  // --- Edges / connecting ---------------------------------------------------
  const onConnect = useCallback(
    (params) => {
      const next = addEdge(
        {
          ...params,
          type: "smoothstep",
          style: { strokeWidth: 2, stroke: "#7d71fe" },
        },
        edges,
      );
      setEdges(next);
      pushSnapshot(nodes, next, filters, "Connected nodes");
    },
    [nodes, edges, filters, setEdges, pushSnapshot],
  );

  const onConnectStart = useCallback(() => setIsConnecting(true), []);
  const onConnectEnd = useCallback(() => setIsConnecting(false), []);

  const onEdgeClick = useCallback(
    (_evt, edge) => {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (!source || !target) return;
      const newId = uid("n");
      const newNode = {
        id: newId,
        type: "stage",
        position: {
          x: (source.position.x + target.position.x) / 2,
          y: (source.position.y + target.position.y) / 2,
        },
        data: {
          n: "+",
          lane: source.data.lane,
          title: "New step",
          when: "",
          where: "",
          desc: "Click Edit to fill in this step.",
          events: [],
        },
      };
      const nextNodes = [...nodes, newNode];
      const nextEdges = [
        ...edges.filter((e) => e.id !== edge.id),
        {
          id: uid("e"),
          source: edge.source,
          target: newId,
          type: "smoothstep",
        },
        {
          id: uid("e"),
          source: newId,
          target: edge.target,
          type: "smoothstep",
        },
      ];
      setNodes(nextNodes);
      setEdges(nextEdges);
      pushSnapshot(nextNodes, nextEdges, filters, "Inserted node on edge");
      flashToast("Node inserted on the edge");
    },
    [nodes, edges, filters, setNodes, setEdges, pushSnapshot],
  );

  const onNodeDragStop = useCallback(() => {
    pushSnapshot(nodes, edges, filters, "Moved node");
  }, [nodes, edges, filters, pushSnapshot]);

  const onPaneClick = useCallback(
    (e) => {
      const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      let dropped = false;

      if (mode === "note") {
        const id = uid("note");
        const newNode = {
          id,
          type: "note",
          position: { x: pos.x - 110, y: pos.y - 60 },
          data: { text: "", color: "amber" },
        };
        const next = [...nodes, newNode];
        setNodes(next);
        pushSnapshot(next, edges, filters, "Added note");
        flashToast("Note added — double-click to write");
        dropped = true;
      } else if (mode === "condition") {
        const id = uid("cond");
        const newNode = {
          id,
          type: "condition",
          position: { x: pos.x - 140, y: pos.y - 80 },
          data: {
            label: "New condition?",
            hint: "",
            yesLabel: "Yes",
            noLabel: "No",
          },
        };
        const next = [...nodes, newNode];
        setNodes(next);
        pushSnapshot(next, edges, filters, "Added condition");
        flashToast("Condition added — connect Yes / No branches");
        dropped = true;
      } else if (mode === "comment") {
        const id = uid("cmt");
        const me = getIdentity();
        const newNode = {
          id,
          type: "comment",
          position: { x: pos.x - 18, y: pos.y - 18 },
          data: { thread: [], resolved: false, creator: me },
        };
        const next = [...nodes, newNode];
        setNodes(next);
        pushSnapshot(next, edges, filters, "Added comment");
        flashToast("Comment dropped — type your message and ⌘↵ to post");
        dropped = true;
      }

      // Pan + (if needed) zoom-in to the drop point so the new element
      // lands center-stage. If user is already zoomed in further, keep it.
      if (dropped) {
        const targetZoom = mode === "comment" ? 1.4 : 1.1;
        setTimeout(() => {
          rf.setCenter(pos.x, pos.y, {
            zoom: Math.max(rf.getZoom(), targetZoom),
            duration: 400,
          });
        }, 60);
      }
    },
    [mode, rf, nodes, edges, filters, setNodes, pushSnapshot],
  );

  function handleAddNode() {
    setEditingId(null);
    setShowForm(true);
  }

  // --- Context menu (right-click on a node) ---------------------------------
  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      const items = [];
      const kind = node.type;
      const label =
        node.data?.title ||
        node.data?.label ||
        node.data?.text?.slice(0, 40) ||
        (kind === "comment" ? "Comment thread" : "Node");

      if (kind === "stage") {
        items.push({
          id: "edit",
          label: "Edit",
          icon: "edit",
          shortcut: "↵",
        });
      }
      if (kind === "comment") {
        items.push({
          id: "comment-toggle",
          label: node.data?.resolved ? "Reopen thread" : "Resolve thread",
          icon: node.data?.resolved ? "reopen" : "resolve",
        });
      }
      items.push({
        id: "duplicate",
        label: "Duplicate",
        icon: "duplicate",
        shortcut: "⌘D",
      });
      items.push({
        id: "add-note",
        label: "Add note next to this",
        icon: "note",
      });
      items.push({
        id: "bring-front",
        label: "Bring to front",
        icon: "bringFront",
      });
      items.push({ divider: true });
      items.push({
        id: "copy-json",
        label: "Copy as JSON",
        icon: "json",
      });
      items.push({ divider: true });
      items.push({
        id: "delete",
        label: "Delete",
        icon: "delete",
        shortcut: "⌫",
        danger: true,
      });

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
        nodeKind: prettyKind(kind),
        label,
        items,
      });
    },
    [],
  );

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  function duplicateNode(id) {
    const src = nodes.find((n) => n.id === id);
    if (!src) return null;
    const newId = `${uid(src.type || "n")}`;
    // Deep-ish clone of data so editing the copy doesn't mutate the source.
    const copy = {
      ...src,
      id: newId,
      selected: false,
      position: {
        x: src.position.x + 40,
        y: src.position.y + 40,
      },
      data: structuredClone(src.data ?? {}),
    };
    // Strip injected callbacks
    if (copy.data) {
      delete copy.data.onChange;
      delete copy.data.onDelete;
      delete copy.data.onEdit;
      delete copy.data.onEventClick;
      delete copy.data.filters;
      delete copy.data.nodeId;
    }
    return copy;
  }

  function handleContextAction(actionId) {
    if (!contextMenu) return;
    const id = contextMenu.nodeId;
    const node = nodes.find((n) => n.id === id);
    if (!node) {
      setContextMenu(null);
      return;
    }

    if (actionId === "edit") {
      setEditingId(id);
    } else if (actionId === "duplicate") {
      const copy = duplicateNode(id);
      if (copy) {
        const next = [...nodes, copy];
        setNodes(next);
        pushSnapshot(next, edges, filters, "Duplicated node");
        flashToast("Node duplicated");
        // Focus camera on the duplicate
        setTimeout(() => {
          rf.setCenter(
            copy.position.x + 160,
            copy.position.y + 100,
            { zoom: Math.max(rf.getZoom(), 0.9), duration: 400 },
          );
        }, 60);
      }
    } else if (actionId === "delete") {
      const nextNodes = nodes.filter((n) => n.id !== id);
      const nextEdges = edges.filter(
        (e) => e.source !== id && e.target !== id,
      );
      setNodes(nextNodes);
      setEdges(nextEdges);
      pushSnapshot(nextNodes, nextEdges, filters, "Deleted node");
      flashToast("Node deleted");
    } else if (actionId === "bring-front") {
      // Move the node to the end of the array (drawn last = on top)
      const next = [...nodes.filter((n) => n.id !== id), node];
      setNodes(next);
      pushSnapshot(next, edges, filters, "Brought to front");
    } else if (actionId === "add-note") {
      const noteId = uid("note");
      const newNode = {
        id: noteId,
        type: "note",
        position: {
          x: node.position.x + 360,
          y: node.position.y + 20,
        },
        data: { text: "", color: "amber" },
      };
      const next = [...nodes, newNode];
      setNodes(next);
      pushSnapshot(next, edges, filters, "Added note");
      flashToast("Note dropped next to the card");
    } else if (actionId === "comment-toggle") {
      const nextNodes = nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, resolved: !n.data.resolved } }
          : n,
      );
      setNodes(nextNodes);
      pushSnapshot(nextNodes, edges, filters, "Toggled thread");
    } else if (actionId === "copy-json") {
      try {
        const payload = { ...node, data: structuredClone(node.data) };
        delete payload.data?.onChange;
        delete payload.data?.onDelete;
        delete payload.data?.onEdit;
        delete payload.data?.onEventClick;
        delete payload.data?.filters;
        delete payload.data?.nodeId;
        navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        flashToast("Node JSON copied to clipboard");
      } catch {
        flashToast("Couldn't copy to clipboard");
      }
    }

    setContextMenu(null);
  }

  function handleFormSubmit(payload) {
    if (editingId) {
      const nextNodes = nodes.map((n) =>
        n.id === editingId ? { ...n, data: { ...n.data, ...payload } } : n,
      );
      setNodes(nextNodes);
      pushSnapshot(nextNodes, edges, filters, "Edited node");
      flashToast("Node updated");
    } else {
      const id = uid("n");
      // Drop the new node at the current viewport center so it lands in the
      // section the user is currently looking at.
      const rect = canvasRef.current?.getBoundingClientRect();
      let centerFlow = { x: 600, y: 200 };
      if (rect) {
        centerFlow = rf.screenToFlowPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
      // Offset so the card is centered on the viewport center (card is
      // ~340px wide; we just bias by half a typical card).
      const newNode = {
        id,
        type: "stage",
        position: { x: centerFlow.x - 170, y: centerFlow.y - 120 },
        data: { ...payload, n: nodes.length + 1 },
      };
      const nextNodes = [...nodes, newNode];
      setNodes(nextNodes);
      pushSnapshot(nextNodes, edges, filters, "Created node");
      flashToast("Node created");

      // Focus the camera on the new node so the user sees it land.
      setTimeout(() => {
        rf.setCenter(centerFlow.x, centerFlow.y, {
          zoom: Math.max(rf.getZoom(), 0.9),
          duration: 400,
        });
      }, 60);
    }
    setShowForm(false);
    setEditingId(null);
  }

  // --- Auto layout (Tidy) ---------------------------------------------------
  // Lays out headers, stages, conditions, and state cards together — grouped
  // by lane, sorted by their current y so the existing order is preserved.
  // Notes stay where they are (they're user annotations, not part of the
  // canonical flow).
  function autoLayout() {
    const notes = nodes.filter((n) => n.type === "note");
    const tracked = nodes.filter((n) => n.type !== "note");

    const byLane = {};
    for (const n of tracked) {
      const lane = n.data?.lane || "merchant";
      if (!byLane[lane]) byLane[lane] = [];
      byLane[lane].push(n);
    }

    function heightOf(n) {
      if (n.type === "header") return 130;
      if (n.type === "condition") return 220;
      if (n.type === "merchant-state") return 620;
      const evCount = n.data?.events?.length || 0;
      return 210 + evCount * 44;
    }

    const Y_START = 60;
    const GAP = 100;

    const placed = [];
    for (const lane of Object.keys(byLane)) {
      const list = byLane[lane]
        .slice()
        .sort((a, b) => a.position.y - b.position.y);
      const x = LAYOUT.LANE_X[lane] ?? LAYOUT.LANE_X.merchant;
      let cursor = Y_START;
      for (const n of list) {
        placed.push({ ...n, position: { x, y: cursor } });
        cursor += heightOf(n) + GAP;
      }
    }

    const nextNodes = [...placed, ...notes];
    setNodes(nextNodes);
    pushSnapshot(nextNodes, edges, filters, "Tidied layout");
    setTimeout(() => rf.fitView({ padding: 0.18, duration: 400 }), 60);
    flashToast("Layout tidied");
  }

  // --- Save / sync helpers --------------------------------------------------
  async function pushAndUpdate(nextViews, successMessage) {
    skipReloadRef.current = true;
    setViews(nextViews);
    setSync((s) => ({ ...s, state: "loading", label: "Saving…" }));
    const res = await pushRemoteViews(nextViews);
    if (res.ok) {
      setSync({
        state: "remote",
        label: "Shared",
        tooltip: "Synced with the shared backend",
      });
      flashToast(successMessage || "Saved to shared backend");
    } else if (res.configured === false) {
      setSync({
        state: "local",
        label: "Local only",
        tooltip:
          "Shared backend (Vercel KV) is not connected. Views are kept in this browser only.",
      });
      flashToast(successMessage || "Saved locally (backend not connected)");
    } else {
      setSync({
        state: "offline",
        label: "Offline",
        tooltip: "Couldn't reach the backend. Saved locally only.",
      });
      flashToast("Saved locally — backend unreachable");
    }
  }

  function saveCurrentView() {
    const next = views.map((v) =>
      v.id === currentViewId ? { ...v, nodes, edges, filters } : v,
    );
    pushAndUpdate(next, `Saved "${currentView.name}"`);
  }

  function createView() {
    const id = uid("v");
    const newView = {
      id,
      name: "Untitled view",
      nodes: [],
      edges: [],
      filters: defaultFilters(),
    };
    skipReloadRef.current = true;
    setCurrentViewId(id);
    restoringRef.current = true;
    setNodes([]);
    setEdges([]);
    setFilters(defaultFilters());
    setShowViews(false);
    pushAndUpdate([...views, newView], "New view created");
  }

  function duplicateView(id) {
    const v = views.find((x) => x.id === id);
    if (!v) return;
    const newId = uid("v");
    const snapshot =
      v.id === currentViewId ? { ...v, nodes, edges, filters } : v;
    const copy = { ...snapshot, id: newId, name: `${v.name} (copy)` };
    skipReloadRef.current = true;
    setCurrentViewId(newId);
    restoringRef.current = true;
    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
    setFilters(snapshot.filters || defaultFilters());
    setShowViews(false);
    pushAndUpdate([...views, copy], "View duplicated");
  }

  function renameView(id, name) {
    const next = views.map((v) => (v.id === id ? { ...v, name } : v));
    pushAndUpdate(next);
  }

  function deleteView(id) {
    if (views.length === 1) return;
    const remaining = views.filter((v) => v.id !== id);
    if (id === currentViewId) {
      setCurrentViewId(remaining[0].id);
    }
    pushAndUpdate(remaining, "View deleted");
  }

  function selectView(id) {
    setCurrentViewId(id);
    setShowViews(false);
  }

  function resetToDefaults() {
    const fresh = makeDefaultViews();
    skipReloadRef.current = true;
    setCurrentViewId(fresh[0].id);
    restoringRef.current = true;
    setNodes(fresh[0].nodes);
    setEdges(fresh[0].edges);
    setFilters(fresh[0].filters);
    setShowViews(false);
    pushAndUpdate(fresh, "Reset to default journeys");
  }

  function toggleFilter(t) {
    const nextFilters = { ...filters, [t]: !filters[t] };
    setFilters(nextFilters);
    pushSnapshot(nodes, edges, nextFilters, `Toggled ${t} filter`);
  }

  function fitView() {
    rf.fitView({ padding: 0.18, duration: 400 });
  }

  // Command palette callbacks
  function paletteFocusNode(nodeId) {
    const n = nodes.find((x) => x.id === nodeId);
    if (!n) return;
    const cx = n.position.x + 170;
    const cy = n.position.y + 140;
    rf.setCenter(cx, cy, { zoom: 1, duration: 400 });
    setShowPalette(false);
  }
  function paletteOpenEvent(nodeId, event) {
    const n = nodes.find((x) => x.id === nodeId);
    if (n) paletteFocusNode(nodeId);
    setActiveEvent(event);
    setActiveStage(n?.data);
    setShowPalette(false);
  }
  function paletteSwitchView(id) {
    selectView(id);
    setShowPalette(false);
  }

  const editingNode = editingId ? nodes.find((n) => n.id === editingId) : null;
  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  // Dirty state — nodes/edges/filters drift away from the saved view by
  // reference. Reference equality is cheap and accurate because every
  // edit replaces the array, and saveCurrentView writes the current
  // refs back into `views`.
  const isDirty = useMemo(() => {
    if (!currentView) return false;
    return (
      nodes !== currentView.nodes ||
      edges !== currentView.edges ||
      filters !== currentView.filters
    );
  }, [nodes, edges, filters, currentView]);

  // Document title + browser beforeunload guard
  useEffect(() => {
    const base = "Conjourney — Convi User Journey";
    document.title = isDirty ? `• ${base}` : base;
  }, [isDirty]);

  useEffect(() => {
    function onBeforeUnload(e) {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  return (
    <div className="editor">
      <Toolbar
        viewName={currentView.name}
        views={views}
        currentViewId={currentViewId}
        filters={filters}
        onChangeView={selectView}
        onAddNode={handleAddNode}
        onOpenViews={() => setShowViews(true)}
        onSaveView={saveCurrentView}
        onLogout={onLogout}
        onToggleFilter={toggleFilter}
        theme={theme}
        onToggleTheme={onToggleTheme}
        isDirty={isDirty}
      />

      <div
        ref={canvasRef}
        className={`canvas mode-${mode} ${isConnecting ? "connecting" : ""}`}
      >
        <ReactFlow
          nodes={renderedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onNodeDragStop={onNodeDragStop}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={(e) => {
            e.preventDefault();
            closeContextMenu();
          }}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{ type: "smoothstep" }}
          proOptions={{ hideAttribution: true }}
          panOnDrag={mode === "hand" ? true : [1, 2]}
          selectionOnDrag={mode === "select"}
          nodesDraggable={mode === "select" || mode === "note"}
          panOnScroll={true}
          zoomOnScroll={false}
          zoomOnPinch={true}
          connectionRadius={60}
          connectionLineType="smoothstep"
          connectionLineStyle={{
            strokeWidth: 3,
            stroke: "#7d71fe",
            strokeDasharray: "6 4",
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.6}
            color={
              theme === "dark"
                ? "rgba(255, 255, 255, 0.14)"
                : "rgba(15, 15, 26, 0.16)"
            }
          />
          <MiniMap
            pannable
            zoomable
            nodeColor={miniMapColor}
            maskColor="rgba(125, 113, 254, 0.06)"
          />
          <Controls position="bottom-right" showInteractive={false} />
          {presenceEnabled && <LiveCursors />}
        </ReactFlow>

        {presenceEnabled && (
          <PresenceTracker
            canvasRef={canvasRef}
            viewId={currentViewId}
            viewName={currentView.name}
            mode={mode}
          />
        )}

        {presenceEnabled && (
          <LiveEditSync
            nodes={nodes}
            edges={edges}
            filters={filters}
            currentViewId={currentViewId}
            onRemotePatch={(nextNodes, nextEdges, nextFilters) => {
              restoringRef.current = true;
              setNodes(nextNodes);
              setEdges(nextEdges);
              setFilters(nextFilters);
            }}
          />
        )}

        <FloatingToolbar
          mode={mode}
          onChangeMode={setMode}
          onAddNode={handleAddNode}
          onFitView={fitView}
          onSaveView={saveCurrentView}
          onAutoLayout={autoLayout}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onSearch={() => setShowPalette(true)}
          onHistory={() => setShowHistory(true)}
          sync={sync}
        />

        <div className="hint">
          <kbd>⌘K</kbd> search · <kbd>V</kbd> select · <kbd>H</kbd> hand ·{" "}
          <kbd>N</kbd> note · <kbd>C</kbd> condition · <kbd>M</kbd> comment ·{" "}
          <kbd>⌘Z</kbd> undo · two-finger drag pans · pinch zooms.
        </div>
      </div>

      {showViews && (
        <ViewsPanel
          views={views}
          currentViewId={currentViewId}
          onClose={() => setShowViews(false)}
          onSelect={selectView}
          onCreate={createView}
          onDuplicate={duplicateView}
          onRename={renameView}
          onDelete={deleteView}
          onReset={resetToDefaults}
        />
      )}

      {showForm && (
        <NodeForm
          initial={editingNode?.data || null}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      {activeEvent && (
        <EventDetail
          event={activeEvent}
          stage={activeStage}
          onClose={() => setActiveEvent(null)}
        />
      )}

      {showPalette && (
        <CommandPalette
          nodes={nodes}
          views={views}
          onFocusNode={paletteFocusNode}
          onOpenEvent={paletteOpenEvent}
          onSwitchView={paletteSwitchView}
          onClose={() => setShowPalette(false)}
        />
      )}

      {showHistory && (
        <HistoryPanel
          history={history}
          pointer={pointer}
          onRestore={(idx) => {
            restore(idx);
            flashToast(`Restored — ${history[idx].label}`);
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      <NodeContextMenu
        menu={contextMenu}
        onClose={closeContextMenu}
        onAction={handleContextAction}
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

const NODE_TYPES = {
  stage: StageNode,
  note: NoteNode,
  condition: ConditionNode,
  "merchant-state": MerchantStateNode,
  header: HeaderNode,
  comment: CommentNode,
};

function prettyKind(t) {
  if (t === "stage") return "Stage";
  if (t === "note") return "Note";
  if (t === "condition") return "Condition";
  if (t === "merchant-state") return "State";
  if (t === "header") return "Header";
  if (t === "comment") return "Comment";
  return t;
}

function miniMapColor(node) {
  if (node?.type === "note") return "#f59e0b";
  if (node?.type === "condition") return "#fb923c";
  if (node?.type === "comment") return "#e11d48";
  const lane = node?.data?.lane;
  if (lane === "merchant") return "#7d71fe";
  if (lane === "shopper") return "#0d9488";
  return "#9CA3AF";
}

export default function Editor(props) {
  return (
    <ReactFlowProvider>
      <EditorInner {...props} />
    </ReactFlowProvider>
  );
}
