import { memo } from "react";
import { motion } from "framer-motion";
import { Handle, Position } from "reactflow";
import type { AppNode } from "../../types/appGraph";
import { ChangeMark } from "../common/ChangeBadge";

interface StateNodeData {
  node: AppNode;
  depth: number;
  selected: boolean;
  viewMode: "product" | "runtime" | "change";
}

function StateNodeComponent({ data }: { data: StateNodeData }) {
  const { node, selected, viewMode } = data;
  const isAdded = node.changeType === "added";
  const isObserved = node.verificationStatus !== "source-only";

  return (
    <motion.div
      initial={
        isAdded
          ? { opacity: 0, scale: 0.8, y: -6 }
          : { opacity: 0, scale: 0.94 }
      }
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
        delay: isAdded ? 0.18 : 0,
      }}
      className={`relative w-[200px] rounded-md border bg-[var(--color-bg-elevated)] px-3 py-2 shadow-sm transition ${
        selected
          ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent-soft)]"
          : isAdded
            ? "border-emerald-500/50"
            : "border-[var(--color-border)]"
      }`}
      style={
        viewMode === "runtime" && !isObserved
          ? { borderStyle: "dashed", opacity: 0.7 }
          : undefined
      }
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-[var(--color-text-subtle)]"
      />

      <div className="flex items-center gap-1.5">
        <div
          className={`h-1.5 w-1.5 rounded-full ${
            isObserved ? "bg-emerald-500" : "bg-zinc-400"
          }`}
        />
        <span className="truncate text-[12px] font-medium italic text-[var(--color-text)]">
          {node.name}
        </span>
        {isAdded && <ChangeMark changeType="added" />}
      </div>

      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">
        UI State
      </div>

      {node.stateCondition && (
        <div className="mt-1.5 truncate font-mono text-[10px] text-[var(--color-text-muted)]">
          {node.stateCondition}
        </div>
      )}

      {node.metadata?.capacity && (
        <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
          Capacity: {String(node.metadata.capacity)}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-[var(--color-text-subtle)]"
      />
    </motion.div>
  );
}

export const StateNode = memo(StateNodeComponent);
