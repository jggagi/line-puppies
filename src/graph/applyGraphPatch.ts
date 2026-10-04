import type { AppGraph, AppNode, AppEdge, GraphPatch } from "../types/appGraph";

export function applyGraphPatch(
  baseline: AppGraph,
  patch: GraphPatch,
): AppGraph {
  const removedNodeIds = new Set(patch.removedNodeIds);
  const removedEdgeIds = new Set(patch.removedEdgeIds);

  const modifiedNodeMap = new Map<string, Partial<AppNode>>();
  for (const m of patch.modifiedNodes) modifiedNodeMap.set(m.nodeId, m.changes);

  const modifiedEdgeMap = new Map<string, Partial<AppEdge>>();
  for (const m of patch.modifiedEdges) modifiedEdgeMap.set(m.edgeId, m.changes);

  const nodes: AppNode[] = baseline.nodes
    .filter((node) => !removedNodeIds.has(node.id))
    .map((node) =>
      modifiedNodeMap.has(node.id)
        ? { ...node, ...modifiedNodeMap.get(node.id)! }
        : node,
    )
    .concat(patch.addedNodes);

  const edges: AppEdge[] = baseline.edges
    .filter((edge) => !removedEdgeIds.has(edge.id))
    .map((edge) =>
      modifiedEdgeMap.has(edge.id)
        ? { ...edge, ...modifiedEdgeMap.get(edge.id)! }
        : edge,
    )
    .concat(patch.addedEdges);

  // Merge flows (baseline first, then any flows that reference patched nodes).
  const flows = baseline.flows.filter(
    (flow) =>
      flow.nodeIds.every((id) => nodes.some((n) => n.id === id)),
  );

  return {
    ...baseline,
    branch: patch.branch,
    nodes,
    edges,
    flows,
  };
}
