import { useMemo } from "react";
import { Layers, Workflow, Route, SearchX } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { buildTree, ancestorChain } from "../../graph/buildTree";
import { applyGraphPatch } from "../../graph/applyGraphPatch";
import { baselineGraph } from "../../data/baselineGraph";
import { batteryHealthPatch } from "../../data/batteryHealthPatch";
import type { AppGraph, AppNode } from "../../types/appGraph";
import { AppTreeNode } from "./AppTreeNode";

/** IDs of nodes that match the query, plus all their ancestors (so they remain visible). */
function collectSearchMatches(
  graph: AppGraph,
  query: string,
): { matchIds: Set<string>; visibleIds: Set<string> } {
  const q = query.trim().toLowerCase();
  if (!q) return { matchIds: new Set(), visibleIds: new Set() };

  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const matchIds = new Set<string>();
  for (const n of graph.nodes) {
    if (
      n.name.toLowerCase().includes(q) ||
      (n.description ?? "").toLowerCase().includes(q) ||
      n.type.toLowerCase().includes(q)
    ) {
      matchIds.add(n.id);
    }
  }

  // Expand every ancestor of every match so matches are reachable.
  const visibleIds = new Set<string>(matchIds);
  for (const id of matchIds) {
    let current = byId.get(id);
    while (current?.parentId && byId.has(current.parentId)) {
      visibleIds.add(current.parentId);
      current = byId.get(current.parentId);
    }
  }
  return { matchIds, visibleIds };
}

/** Prune the tree to only keep branches that contain a visible node. */
function pruneTree(
  nodes: AppNode[],
  visibleIds: Set<string>,
): AppNode[] {
  return nodes.filter((n) => visibleIds.has(n.id));
}

export function AppTree() {
  const branch = useAppStore((s) => s.branch);
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const selectedFlowId = useAppStore((s) => s.selectedFlowId);
  const selectFlow = useAppStore((s) => s.selectFlow);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const expandedTreeNodeIds = useAppStore((s) => s.expandedTreeNodeIds);

  const activeGraph = useMemo(
    () =>
      branch === "feature/battery-health"
        ? applyGraphPatch(baselineGraph, batteryHealthPatch)
        : baselineGraph,
    [branch],
  );

  const { matchIds, visibleIds } = useMemo(
    () => collectSearchMatches(activeGraph, searchQuery),
    [activeGraph, searchQuery],
  );

  const searching = searchQuery.trim().length > 0;

  // Effective node set: pruned when searching, full otherwise.
  const effectiveNodes = useMemo(
    () => (searching ? pruneTree(activeGraph.nodes, visibleIds) : activeGraph.nodes),
    [activeGraph, searching, visibleIds],
  );

  const effectiveGraph = useMemo<AppGraph>(
    () => ({ ...activeGraph, nodes: effectiveNodes }),
    [activeGraph, effectiveNodes],
  );

  const tree = useMemo(() => buildTree(effectiveGraph), [effectiveGraph]);
  const chain = useMemo(
    () => ancestorChain(selectedNodeId, activeGraph),
    [selectedNodeId, activeGraph],
  );

  // While searching, every visible ancestor should be expanded.
  const effectiveExpanded = useMemo(() => {
    if (!searching) return expandedTreeNodeIds;
    return new Set(visibleIds);
  }, [searching, visibleIds, expandedTreeNodeIds]);

  return (
    <div className="flex flex-col gap-4 p-3">
      <div>
        <div className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          <Layers size={11} />
          App Tree
        </div>
        {tree.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-2 py-6 text-center">
            <SearchX size={20} className="text-[var(--color-text-subtle)]" />
            <div className="text-xs text-[var(--color-text-muted)]">
              No matches for
            </div>
            <div className="font-mono text-xs text-[var(--color-text)]">
              “{searchQuery}”
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {tree.map((tn) => (
              <AppTreeNode
                key={tn.node.id}
                treeNode={tn}
                ancestorChain={chain}
                matchIds={matchIds}
                forceExpandedIds={effectiveExpanded}
              />
            ))}
          </div>
        )}
      </div>

      {!searching && activeGraph.flows.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
            <Workflow size={11} />
            Flows
          </div>
          <div className="space-y-0.5">
            {activeGraph.flows.map((flow) => (
              <button
                key={flow.id}
                onClick={() => selectFlow(selectedFlowId === flow.id ? undefined : flow.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
                  selectedFlowId === flow.id
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]"
                }`}
              >
                <Route size={12} />
                <span className="truncate">{flow.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
