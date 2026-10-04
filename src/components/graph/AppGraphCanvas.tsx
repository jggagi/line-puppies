import { useCallback, useEffect, useMemo, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { useAppStore } from "../../store/useAppStore";
import { baselineGraph } from "../../data/baselineGraph";
import { batteryHealthPatch } from "../../data/batteryHealthPatch";
import { applyGraphPatch } from "../../graph/applyGraphPatch";
import { deriveVisibleGraph } from "../../graph/deriveVisibleGraph";
import { layoutGraph } from "./graphLayout";
import { ScreenNode } from "./ScreenNode";
import { StateNode } from "./StateNode";
import { TransitionEdge } from "./TransitionEdge";

const nodeTypes: NodeTypes = {
  screen: ScreenNode,
  state: StateNode,
};

const edgeTypes: EdgeTypes = {
  transition: TransitionEdge,
};

function CanvasInner({ resetSignal }: { resetSignal: number }) {
  const branch = useAppStore((s) => s.branch);
  const viewMode = useAppStore((s) => s.viewMode);
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const selectedEdgeId = useAppStore((s) => s.selectedEdgeId);
  const selectedFlowId = useAppStore((s) => s.selectedFlowId);
  const selectNode = useAppStore((s) => s.selectNode);
  const selectEdge = useAppStore((s) => s.selectEdge);

  const { fitView, setCenter, getNode } = useReactFlow();
  const didInitialFit = useRef(false);

  const activeGraph = useMemo(
    () =>
      branch === "feature/battery-health"
        ? applyGraphPatch(baselineGraph, batteryHealthPatch)
        : baselineGraph,
    [branch],
  );

  const visible = useMemo(
    () =>
      deriveVisibleGraph(activeGraph, {
        selectedNodeId,
        selectedEdgeId,
        selectedFlowId,
      }),
    [activeGraph, selectedNodeId, selectedEdgeId, selectedFlowId],
  );

  const layout = useMemo(
    () =>
      layoutGraph(visible, activeGraph, {
        selectedNodeId,
        selectedEdgeId,
        viewMode,
      }),
    [visible, activeGraph, selectedNodeId, selectedEdgeId, viewMode],
  );

  // Fit the view whenever the visible node set meaningfully changes.
  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.18, duration: 320 }), 40);
    return () => clearTimeout(t);
  }, [visible, fitView]);

  // Center on selected node for smoother UX.
  useEffect(() => {
    if (!selectedNodeId) return;
    const node = getNode(selectedNodeId);
    if (!node) return;
    if (!didInitialFit.current) {
      didInitialFit.current = true;
      return;
    }
    setCenter(node.position.x + 110, node.position.y + 55, {
      zoom: 1,
      duration: 320,
    });
  }, [selectedNodeId, getNode, setCenter]);

  // Reset signal forces a fit.
  useEffect(() => {
    if (resetSignal === 0) return;
    const t = setTimeout(() => fitView({ padding: 0.18, duration: 320 }), 20);
    return () => clearTimeout(t);
  }, [resetSignal, fitView]);

  const handleNodeClick = useCallback(
    (_: unknown, node: { id: string }) => selectNode(node.id),
    [selectNode],
  );

  const handleEdgeClick = useCallback(
    (_: unknown, edge: { id: string }) => selectEdge(edge.id),
    [selectEdge],
  );

  return (
    <ReactFlow
      nodes={layout.nodes}
      edges={layout.edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={{ type: "transition" }}
    >
      <Background gap={28} size={1} color="var(--color-border)" />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  );
}

export function AppGraphCanvas({ resetSignal }: { resetSignal: number }) {
  return (
    <ReactFlowProvider>
      <CanvasInner resetSignal={resetSignal} />
    </ReactFlowProvider>
  );
}
