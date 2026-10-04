import { memo } from "react";
import { motion } from "framer-motion";
import { Handle, Position } from "reactflow";
import { Smartphone, Battery, Wifi, Bell, Box, Settings as SettingsIcon } from "lucide-react";
import type { AppNode, VerificationStatus } from "../../types/appGraph";
import { ChangeMark } from "../common/ChangeBadge";

interface ScreenNodeData {
  node: AppNode;
  depth: number;
  selected: boolean;
  viewMode: "product" | "runtime" | "change";
}

const statusDot: Record<VerificationStatus, string> = {
  "source-only": "bg-zinc-400",
  observed: "bg-sky-500",
  verified: "bg-emerald-500",
  failed: "bg-rose-500",
};

function iconFor(name: string) {
  const lc = name.toLowerCase();
  if (lc.includes("battery")) return Battery;
  if (lc.includes("network") || lc.includes("internet") || lc.includes("wifi") || lc.includes("vpn"))
    return Wifi;
  if (lc.includes("notif")) return Bell;
  if (lc.includes("apps") || lc.includes("app")) return Box;
  if (lc.includes("setting")) return SettingsIcon;
  return Smartphone;
}

function ScreenNodeComponent({ data }: { data: ScreenNodeData }) {
  const { node, selected, viewMode } = data;
  const Icon = iconFor(node.name);
  const isAdded = node.changeType === "added";
  const isObserved = node.verificationStatus !== "source-only";

  return (
    <motion.div
      initial={
        isAdded
          ? { opacity: 0, scale: 0.85, y: -8 }
          : { opacity: 0, scale: 0.96 }
      }
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
        delay: isAdded ? 0.12 : 0,
      }}
      className={`relative w-[220px] rounded-lg border bg-[var(--color-bg-elevated)] px-3 py-2.5 shadow-sm transition ${
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

      <div className="flex items-start gap-2">
        <div
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
            isAdded
              ? "bg-emerald-500/15 text-emerald-500"
              : "bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]"
          }`}
        >
          <Icon size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-[var(--color-text)]">
              {node.name}
            </span>
            {isAdded && <ChangeMark changeType="added" />}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">
            {node.type}
          </div>
        </div>
      </div>

      {node.description && (
        <div className="mt-1.5 line-clamp-1 text-[11px] text-[var(--color-text-muted)]">
          {node.description}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--color-text-subtle)]">
        <span className="inline-flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot[node.verificationStatus]}`} />
          {node.verificationStatus}
        </span>
        <span>·</span>
        <span>{node.sourceRefs.length} source refs</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-[var(--color-text-subtle)]"
      />
    </motion.div>
  );
}

export const ScreenNode = memo(ScreenNodeComponent);
