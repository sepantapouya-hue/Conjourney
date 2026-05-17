import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import StageNode from "./StageNode";
import Toolbar from "./Toolbar";
import ViewsPanel from "./ViewsPanel";
import NodeForm from "./NodeForm";
import EventDetail from "./EventDetail";
import { initialNodes, initialEdges, defaultFilters } from "../data/seed";

const VIEWS_KEY = "conjourney_views_v1";
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

function loadViews() {
  try {
    const raw = localStorage.getItem(VIEWS_KEY);
    if (!raw) return [makeDefaultView()];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0)
      return [makeDefaultView()];
    return parsed;
  } catch {
    return [makeDefaultView()];
  }
}

function uid(prefix = "n") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}

function EditorInner({ onLogout }) {
  const [views, setViews] = useState(() => loadViews());
  const [currentViewId, setCurrentViewId] = useState(() => {
    const stored = localStorage.getItem(CURRENT_KEY);
    return stored || "default";
  });

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
  const [mode, setMode] = useState("select"); // 'select' | 'hand'

  const skipReloadRef = useRef(false);
  const rf = useReactFlow();

  // Persist views and current view id
  useEffect(() => {
    localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
  }, [views]);
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

  // Keyboard shortcuts: +/- zoom, V = select, H = hand
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
        flashToast("Select mode — drag to select, click to edit");
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

  const onEditNode = useCallback((stage) => {
    setEditingId(String(stage.id ?? stage.nodeId ?? ""));
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
    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        nodeId: n.id,
        filters,
        onEventClick,
        onEdit: (stage) => setEditingId(String(stage.nodeId ?? n.id)),
        onDelete: (stage) => onDeleteNode({ ...stage, nodeId: n.id }),
      },
    }));
  }, [nodes, filters, onEventClick, onDeleteNode]);

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

  function saveCurrentView() {
    skipReloadRef.current = true;
    setViews((vs) =>
      vs.map((v) =>
        v.id === currentViewId
          ? { ...v, nodes, edges, filters }
          : v,
      ),
    );
    flashToast(`Saved “${currentView.name}”`);
  }

  function createView() {
    const id = uid("v");
    skipReloadRef.current = true;
    setViews((vs) => [
      ...vs,
      {
        id,
        name: "Untitled view",
        nodes: [],
        edges: [],
        filters: defaultFilters(),
      },
    ]);
    setCurrentViewId(id);
    setNodes([]);
    setEdges([]);
    setFilters(defaultFilters());
    setShowViews(false);
  }

  function duplicateView(id) {
    const v = views.find((x) => x.id === id);
    if (!v) return;
    const newId = uid("v");
    const snapshot =
      v.id === currentViewId
        ? { ...v, nodes, edges, filters }
        : v;
    skipReloadRef.current = true;
    setViews((vs) => [
      ...vs,
      { ...snapshot, id: newId, name: `${v.name} (copy)` },
    ]);
    setCurrentViewId(newId);
    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
    setFilters(snapshot.filters || defaultFilters());
    setShowViews(false);
    flashToast("View duplicated");
  }

  function renameView(id, name) {
    setViews((vs) => vs.map((v) => (v.id === id ? { ...v, name } : v)));
  }

  function deleteView(id) {
    if (views.length === 1) return;
    const remaining = views.filter((v) => v.id !== id);
    setViews(remaining);
    if (id === currentViewId) {
      setCurrentViewId(remaining[0].id);
    }
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
        mode={mode}
        onChangeMode={setMode}
        onChangeView={selectView}
        onAddNode={handleAddNode}
        onOpenViews={() => setShowViews(true)}
        onSaveView={saveCurrentView}
        onLogout={onLogout}
        onToggleFilter={toggleFilter}
        onFitView={fitView}
      />

      <div className={`canvas mode-${mode}`}>
        <ReactFlow
          nodes={renderedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{ type: "smoothstep" }}
          proOptions={{ hideAttribution: true }}
          panOnDrag={mode === "hand" ? true : [1, 2]}
          selectionOnDrag={mode === "select"}
          nodesDraggable={mode === "select"}
          panOnScroll={false}
          zoomOnScroll={true}
        >
          <Background gap={28} size={1} color="rgba(15, 15, 26, 0.06)" />
          <MiniMap
            pannable
            zoomable
            nodeColor={miniMapColor}
            maskColor="rgba(91, 79, 233, 0.06)"
          />
          <Controls position="bottom-right" showInteractive={false} />
        </ReactFlow>

        <div className="hint">
          <kbd>V</kbd> select · <kbd>H</kbd> hand · <kbd>+</kbd>/<kbd>−</kbd>{" "}
          zoom · drag from a handle to connect · click an edge to insert a node.
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

const NODE_TYPES = { stage: StageNode };

function miniMapColor(node) {
  const lane = node?.data?.lane;
  if (lane === "merchant") return "#7C5CFF";
  if (lane === "shopper") return "#14B8A6";
  return "#9CA3AF";
}

export default function Editor(props) {
  return (
    <ReactFlowProvider>
      <EditorInner {...props} />
    </ReactFlowProvider>
  );
}
