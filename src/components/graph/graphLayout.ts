import dagre from "dagre";
import type { AppGraph, AppNode } from "../../types/appGraph";
import type { VisibleGraph } from "../../graph/deriveVisibleGraph";
import { Position, type Node, type Edge } from "reactflow";

const NODE_WIDTH = 220;
const SCREEN_HEIGHT = 110;
const STATE_HEIGHT = 90;

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

function depthOf(node: AppNode, graph: AppGraph): number {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  let depth = 0;
  let current: AppNode | undefined = node;
  while (current?.parentId && byId.has(current.parentId)) {
    depth += 1;
    current = byId.get(current.parentId);
  }
  return depth;
}

export function layoutGraph(
  visible: VisibleGraph,
  graph: AppGraph,
  options: {
    selectedNodeId?: string;
    selectedEdgeId?: string;
    viewMode: "product" | "runtime" | "change";
  },
): LayoutResult {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB",
    nodesep: 48,
    ranksep: 80,
    marginx: 40,
    marginy: 40,
  });
  g.setDefaultEdgeLabel(() => ({}));

  const visibleNodeIds = new Set(visible.nodes.map((n) => n.id));

  for (const node of visible.nodes) {
    const h = node.type === "state" ? STATE_HEIGHT : SCREEN_HEIGHT;
    g.setNode(node.id, { width: NODE_WIDTH, height: h });
  }

  for (const edge of visible.edges) {
    if (visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)) {
      g.setEdge(edge.from, edge.to);
    }
  }

  dagre.layout(g);

  const nodes: Node[] = visible.nodes.map((node) => {
    const pos = g.node(node.id);
    const depth = depthOf(node, graph);
    return {
      id: node.id,
      type: node.type === "state" ? "state" : "screen",
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - pos.height / 2 },
      data: {
        node,
        depth,
        selected: node.id === options.selectedNodeId,
        viewMode: options.viewMode,
      },
      draggable: true,
      selectable: true,
    };
  });

  const edges: Edge[] = visible.edges.map((edge) => {
    const isHighlighted =
      edge.id === options.selectedEdgeId ||
      edge.from === options.selectedNodeId ||
      edge.to === options.selectedNodeId;
    const isAdded = edge.changeType === "added";
    const isObserved = edge.observed;

    return {
      id: edge.id,
      source: edge.from,
      target: edge.to,
      type: "transition",
      animated: isHighlighted && isObserved,
      data: {
        edge,
        highlighted: isHighlighted,
        viewMode: options.viewMode,
      },
      style: {
        stroke: isAdded
          ? "var(--color-added)"
          : isObserved
            ? "var(--color-text-muted)"
            : "var(--color-text-subtle)",
        strokeWidth: isHighlighted ? 2 : 1.5,
        strokeDasharray: !isObserved ? "5 4" : undefined,
        opacity: options.viewMode === "change" && !isAdded && edge.changeType === "unchanged" ? 0.45 : 1,
      },
    };
  });

  // Force horizontal source/target handles for a tidy vertical layout.
  void Position;

  return { nodes, edges };
}
