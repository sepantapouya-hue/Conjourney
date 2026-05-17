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
import Toolbar from "./Toolbar";
import ViewsPanel from "./ViewsPanel";
import NodeForm from "./NodeForm";
import EventDetail from "./EventDetail";
import FloatingToolbar from "./FloatingToolbar";
import { initialNodes, initialEdges, defaultFilters } from "../data/seed";
import {
  loadLocal,
  saveLocal,
  fetchRemoteViews,
  pushRemoteViews,
} from "../lib/viewsApi";

const CURRENT_KEY = "conjourney_current_v1";

function makeDefaultView() {
  return {
    id: "default",
    name: "Full journey",
    nodes: initialNodes,
    edges: initialEdges,
    filters: defaultFilters(),
  };
}

function uid(prefix = "n") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}

function EditorInner({ onLogout }) {
  const [views, setViews] = useState(() => {
    const local = loadLocal();
    if (Array.isArray(local) && local.length) return local;
    return [makeDefaultView()];
  });
  const [currentViewId, setCurrentViewId] = useState(() => {
    return localStorage.getItem(CURRENT_KEY) || "default";
  });

  // Sync status: 'loading' | 'remote' | 'local' | 'offline'
  const [sync, setSync] = useState({ state: "loading", label: "Syncing…" });

  const currentView =
    views.find((v) => v.id === currentViewId) || views[0];

  const [nodes, setNodes, onNodesChange] = useNodesState(currentView.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentView.edges);
  const [filters, setFilters] = useState(currentView.filters);

  const [showViews, setShowViews] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [toast, setToast] = useState(null);
  const [mode, setMode] = useState("select"); // 'select' | 'hand' | 'note'

  const skipReloadRef = useRef(false);
  const rf = useReactFlow();

  // --- initial remote fetch ---------------------------------------------------
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

  // Persist locally on every change (still a fallback cache)
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
    setNodes(v.nodes);
    setEdges(v.edges);
    setFilters(v.filters || defaultFilters());
    setTimeout(() => rf.fitView({ padding: 0.18, duration: 300 }), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentViewId]);

  function flashToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  // Keyboard shortcuts: +/- zoom, V/H/N modes
  useEffect(() => {
    function onKey(e) {
      const t = e.target;
      const editable =
        t?.tagName === "INPUT" ||
        t?.tagName === "TEXTAREA" ||
        t?.tagName === "SELECT" ||
        t?.isContentEditable;
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
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rf]);

  // Event handlers wired into node data
  const onEventClick = useCallback((event, stage) => {
    setActiveEvent(event);
    setActiveStage(stage);
  }, []);

  const onDeleteNode = useCallback(
    (stage) => {
      const id = String(stage.nodeId);
      if (!id) return;
      setNodes((ns) => ns.filter((n) => n.id !== id));
      setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
    },
    [setNodes, setEdges],
  );

  const onNoteChange = useCallback(
    (id, patch) => {
      setNodes((ns) =>
        ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      );
    },
    [setNodes],
  );

  const onNoteDelete = useCallback(
    (id) => {
      setNodes((ns) => ns.filter((n) => n.id !== id));
    },
    [setNodes],
  );

  // When entering edit mode by id, find the node and prefill the form
  useEffect(() => {
    if (editingId == null) return;
    if (editingId === "__new__") {
      setShowForm(true);
      return;
    }
    setShowForm(true);
  }, [editingId]);

  // Inject filters + callbacks into each node's data so the StageNode picks them up
  const renderedNodes = useMemo(() => {
    return nodes.map((n) => {
      if (n.type === "note") {
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
          onDelete: (stage) => onDeleteNode({ ...stage, nodeId: n.id }),
        },
      };
    });
  }, [nodes, filters, onEventClick, onDeleteNode, onNoteChange, onNoteDelete]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: "smoothstep", animated: false }, eds),
      ),
    [setEdges],
  );

  // Click an edge to insert a node between the two it connects
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
      setNodes((ns) => [...ns, newNode]);
      setEdges((es) => [
        ...es.filter((e) => e.id !== edge.id),
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
      ]);
      flashToast("Node inserted on the edge");
    },
    [nodes, setNodes, setEdges],
  );

  // Note mode: click empty canvas to drop a sticky note at that point
  const onPaneClick = useCallback(
    (e) => {
      if (mode !== "note") return;
      const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = uid("note");
      setNodes((ns) => [
        ...ns,
        {
          id,
          type: "note",
          position: { x: pos.x - 110, y: pos.y - 60 },
          data: { text: "", color: "amber" },
        },
      ]);
      flashToast("Note added — double-click to write");
    },
    [mode, rf, setNodes],
  );

  function handleAddNode() {
    setEditingId(null);
    setShowForm(true);
  }

  function handleFormSubmit(payload) {
    if (editingId && editingId !== "__new__") {
      setNodes((ns) =>
        ns.map((n) =>
          n.id === editingId ? { ...n, data: { ...n.data, ...payload } } : n,
        ),
      );
      flashToast("Node updated");
    } else {
      const id = uid("n");
      const newNode = {
        id,
        type: "stage",
        position: { x: 600, y: 200 },
        data: { ...payload, n: nodes.length + 1 },
      };
      setNodes((ns) => [...ns, newNode]);
      flashToast("Node created");
    }
    setShowForm(false);
    setEditingId(null);
  }

  // Save / sync helpers ------------------------------------------------------
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

  function toggleFilter(t) {
    setFilters((f) => ({ ...f, [t]: !f[t] }));
  }

  function fitView() {
    rf.fitView({ padding: 0.18, duration: 400 });
  }

  const editingNode =
    editingId && editingId !== "__new__"
      ? nodes.find((n) => n.id === editingId)
      : null;

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
      />

      <div className={`canvas mode-${mode}`}>
        <ReactFlow
          nodes={renderedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
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
          panOnScroll={false}
          zoomOnScroll={true}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.6}
            color="rgba(15, 15, 26, 0.16)"
          />
          <MiniMap
            pannable
            zoomable
            nodeColor={miniMapColor}
            maskColor="rgba(125, 113, 254, 0.06)"
          />
          <Controls position="bottom-right" showInteractive={false} />
        </ReactFlow>

        <FloatingToolbar
          mode={mode}
          onChangeMode={setMode}
          onAddNode={handleAddNode}
          onFitView={fitView}
          onSaveView={saveCurrentView}
          sync={sync}
        />

        <div className="hint">
          <kbd>V</kbd> select · <kbd>H</kbd> hand · <kbd>N</kbd> note ·{" "}
          <kbd>+</kbd>/<kbd>−</kbd> zoom · click an edge to insert a node ·
          double-click a note to edit.
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

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

const NODE_TYPES = { stage: StageNode, note: NoteNode };

function miniMapColor(node) {
  if (node?.type === "note") return "#f59e0b";
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
