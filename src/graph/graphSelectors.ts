import type { AppGraph, AppEdge } from "../types/appGraph";

export function getNode(graph: AppGraph, nodeId: string | undefined) {
  if (!nodeId) return undefined;
  return graph.nodes.find((n) => n.id === nodeId);
}

export function getEdge(graph: AppGraph, edgeId: string | undefined) {
  if (!edgeId) return undefined;
  return graph.edges.find((e) => e.id === edgeId);
}

export function getFlow(graph: AppGraph, flowId: string | undefined) {
  if (!flowId) return undefined;
  return graph.flows.find((f) => f.id === flowId);
}

export function incomingEdges(graph: AppGraph, nodeId: string): AppEdge[] {
  return graph.edges.filter((e) => e.to === nodeId);
}

export function outgoingEdges(graph: AppGraph, nodeId: string): AppEdge[] {
  return graph.edges.filter((e) => e.from === nodeId);
}

export function entryPaths(
  graph: AppGraph,
  nodeId: string,
): string[] {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const result: string[] = [];
  const visit = (id: string, acc: string[]) => {
    const node = byId.get(id);
    if (!node) return;
    const path = [node.name, ...acc];
    const ins = graph.edges.filter((e) => e.to === id);
    if (ins.length === 0 || !node.parentId) {
      result.push(path.join(" → "));
      return;
    }
    for (const e of ins) {
      if (e.from === id) continue;
      visit(e.from, path);
    }
  };
  visit(nodeId, []);
  return result.slice(0, 4);
}
