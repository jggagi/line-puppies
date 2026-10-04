import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "reactflow";
import type { AppEdge } from "../../types/appGraph";

interface TransitionEdgeData {
  edge: AppEdge;
  highlighted: boolean;
  viewMode: "product" | "runtime" | "change";
}

function TransitionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps & { data?: TransitionEdgeData }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edge = data?.edge;
  const highlighted = data?.highlighted ?? false;
  const isAdded = edge?.changeType === "added";

  const labelBg = isAdded
    ? "bg-[var(--color-added-soft)] text-[var(--color-added)] border-emerald-500/30"
    : highlighted
      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent-border)]"
      : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border)]";

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      {edge && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-medium shadow-sm ${labelBg}`}
          >
            {isAdded && <span className="font-mono font-bold">+</span>}
            <span>{edge.action}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const TransitionEdge = memo(TransitionEdgeComponent);
