import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TreeNode } from "../../graph/buildTree";
import { useAppStore } from "../../store/useAppStore";
import {
  ChangeMark,
  VerificationMark,
  WarningMark,
} from "../common/ChangeBadge";

interface Props {
  treeNode: TreeNode;
  ancestorChain: string[];
  matchIds?: Set<string>;
  forceExpandedIds?: Set<string>;
}

export function AppTreeNode({
  treeNode,
  ancestorChain,
  matchIds,
  forceExpandedIds,
}: Props) {
  const storeExpanded = useAppStore((s) => s.expandedTreeNodeIds.has(treeNode.node.id));
  const toggle = useAppStore((s) => s.toggleTreeNode);
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const selectNode = useAppStore((s) => s.selectNode);

  // When searching, expansion is driven by forceExpandedIds; otherwise by user toggle.
  const expanded = forceExpandedIds
    ? forceExpandedIds.has(treeNode.node.id)
    : storeExpanded;

  const isSelected = selectedNodeId === treeNode.node.id;
  const inPath = ancestorChain.includes(treeNode.node.id);
  const isMatch = matchIds?.has(treeNode.node.id);
  const hasChildren = treeNode.children.length > 0;
  const node = treeNode.node;

  return (
    <div>
      <motion.div
        layout
        onClick={() => selectNode(node.id)}
        className={`group flex cursor-pointer items-center gap-1 rounded-md py-1 pr-2 text-xs transition ${
          isSelected
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
            : isMatch
              ? "bg-[var(--color-added-soft)] text-[var(--color-text)] ring-1 ring-emerald-500/30"
              : inPath
                ? "text-[var(--color-text)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]"
        }`}
        style={{ paddingLeft: `${treeNode.depth * 12 + 4}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggle(node.id);
            }}
            className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--color-text-subtle)] transition group-hover:text-[var(--color-text-muted)]"
          >
            <ChevronRight
              size={12}
              className={`transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <span className="h-4 w-4 shrink-0" />
        )}

        <span
          className={`flex-1 truncate ${
            node.type === "app"
              ? "font-semibold"
              : node.type === "state"
                ? "italic"
                : ""
          }`}
        >
          {node.name}
        </span>

        <span className="flex shrink-0 items-center gap-1.5">
          {node.verificationStatus === "failed" && <WarningMark />}
          {node.changeType !== "unchanged" && <ChangeMark changeType={node.changeType} />}
          <VerificationMark ok={node.verificationStatus !== "source-only"} />
        </span>
      </motion.div>

      <AnimatePresence initial={false}>
        {hasChildren && expanded && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {treeNode.children.map((child) => (
              <AppTreeNode
                key={child.node.id}
                treeNode={child}
                ancestorChain={ancestorChain}
                matchIds={matchIds}
                forceExpandedIds={forceExpandedIds}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
