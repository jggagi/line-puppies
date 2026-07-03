import type { AppGraph, AppNode } from "../types/appGraph";

export interface TreeNode {
  node: AppNode;
  children: TreeNode[];
  depth: number;
}

export function buildTree(graph: AppGraph): TreeNode[] {
  const byId = new Map<string, AppNode>();
  for (const n of graph.nodes) byId.set(n.id, n);

  const childrenOf = (parentId: string): AppNode[] =>
    graph.nodes.filter((n) => n.parentId === parentId);

  const build = (node: AppNode, depth: number): TreeNode => ({
    node,
    depth,
    children: childrenOf(node.id)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((child) => build(child, depth + 1)),
  });

  // Roots: nodes without a parentId, or whose parent is missing.
  const roots = graph.nodes.filter(
    (n) => !n.parentId || !byId.has(n.parentId),
  );

  // Sort roots with the app node first, then alphabetical.
  roots.sort((a, b) => {
    if (a.type === "app" && b.type !== "app") return -1;
    if (b.type === "app" && a.type !== "app") return 1;
    return a.name.localeCompare(b.name);
  });

  return roots.map((root) => build(root, 0));
}

/** Returns ancestor chain (including the node itself) root-first. */
export function ancestorChain(nodeId: string | undefined, graph: AppGraph): string[] {
  if (!nodeId) return [];
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const chain: string[] = [];
  let current = nodeId;
  while (current && byId.has(current)) {
    chain.unshift(current);
    current = byId.get(current)!.parentId ?? "";
  }
  return chain;
}
