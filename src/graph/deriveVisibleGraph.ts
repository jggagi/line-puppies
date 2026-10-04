import type { AppGraph, AppNode, AppEdge } from "../types/appGraph";

export interface VisibleGraph {
  nodes: AppNode[];
  edges: AppEdge[];
}

export interface VisibleGraphOptions {
  selectedNodeId?: string;
  selectedEdgeId?: string;
  selectedFlowId?: string;
}

/**
 * Picks a context-relevant subgraph so the canvas never explodes into a spider web.
 *
 * - Nothing selected: app root + its direct children.
 * - Screen/category selected: parent, siblings, the node, and its direct children.
 * - State node selected: parent screen + sibling states.
 * - Flow selected: every node and edge in the flow, plus the app root for anchoring.
 */
export function deriveVisibleGraph(
  graph: AppGraph,
  options: VisibleGraphOptions,
): VisibleGraph {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const childrenOf = (id: string) =>
    graph.nodes.filter((n) => n.parentId === id);

  const flow = options.selectedFlowId
    ? graph.flows.find((f) => f.id === options.selectedFlowId)
    : undefined;

  if (flow) {
    const flowNodeIds = new Set(flow.nodeIds);
    const flowEdgeIds = new Set(flow.edgeIds);
    const nodes = graph.nodes.filter((n) => flowNodeIds.has(n.id));
    const edges = graph.edges.filter((e) => flowEdgeIds.has(e.id));
    return { nodes, edges };
  }

  if (!options.selectedNodeId) {
    const root = graph.nodes.find((n) => n.type === "app") ?? graph.nodes[0];
    if (!root) return { nodes: [], edges: [] };
    const family = [root, ...childrenOf(root.id)];
    const ids = new Set(family.map((n) => n.id));
    return {
      nodes: family,
      edges: graph.edges.filter(
        (e) => ids.has(e.from) && ids.has(e.to),
      ),
    };
  }

  const selected = byId.get(options.selectedNodeId);
  if (!selected) return { nodes: [], edges: [] };

  const wanted = new Set<string>();
  wanted.add(selected.id);

  // Parent and siblings.
  if (selected.parentId) {
    wanted.add(selected.parentId);
    for (const sib of childrenOf(selected.parentId)) wanted.add(sib.id);
  }

  // Direct children of the selection.
  for (const child of childrenOf(selected.id)) wanted.add(child.id);

  const nodes = graph.nodes.filter((n) => wanted.has(n.id));
  const edges = graph.edges.filter(
    (e) => wanted.has(e.from) && wanted.has(e.to),
  );

  return { nodes, edges };
}
