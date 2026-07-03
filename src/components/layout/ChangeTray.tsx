import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Check, FileCode2, GitPullRequest } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { batteryHealthPatch } from "../../data/batteryHealthPatch";

export function ChangeTray() {
  const branch = useAppStore((s) => s.branch);
  const open = useAppStore((s) => s.changeTrayOpen);
  const setOpen = useAppStore((s) => s.setChangeTrayOpen);
  const selectNode = useAppStore((s) => s.selectNode);
  const selectEdge = useAppStore((s) => s.selectEdge);
  const setViewMode = useAppStore((s) => s.setViewMode);

  const [hovered, setHovered] = useState<string | null>(null);

  if (branch !== "feature/battery-health") return null;

  const addedNodes = batteryHealthPatch.addedNodes;
  const addedEdges = batteryHealthPatch.addedEdges;
  const changedFiles = batteryHealthPatch.changedFiles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
    >
      {/* Collapsed bar */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[var(--color-bg-subtle)]"
      >
        <GitPullRequest size={14} className="text-[var(--color-accent)]" />
        <span className="text-xs font-semibold text-[var(--color-text)]">
          {batteryHealthPatch.name}
        </span>
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
          <span className="text-emerald-500">
            +{addedNodes.length} nodes
          </span>
          <span className="text-emerald-500">
            +{addedEdges.length} edges
          </span>
          <span>{changedFiles.length} files</span>
          <span className="inline-flex items-center gap-1 text-emerald-500">
            <Check size={11} strokeWidth={3} />
            Verified
          </span>
        </div>
        <span className="ml-auto text-[var(--color-text-subtle)]">
          {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="tray-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-0 border-t border-[var(--color-border)]">
          {/* Graph changes */}
          <div className="border-r border-[var(--color-border)] p-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
              Graph changes
            </div>
            <ul className="space-y-1">
              {addedNodes.map((node) => (
                <li key={node.id}>
                  <button
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => {
                      selectNode(node.id);
                      setViewMode("change");
                    }}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition ${
                      hovered === node.id
                        ? "bg-[var(--color-bg-subtle)]"
                        : "hover:bg-[var(--color-bg-subtle)]"
                    }`}
                  >
                    <span className="font-mono font-bold text-emerald-500">+</span>
                    <span className="text-[var(--color-text)]">{node.name}</span>
                    <span className="ml-auto text-[10px] text-[var(--color-text-subtle)]">
                      {node.type}
                    </span>
                  </button>
                </li>
              ))}
              {addedEdges.map((edge) => (
                <li key={edge.id}>
                  <button
                    onClick={() => {
                      selectEdge(edge.id);
                      setViewMode("change");
                    }}
                    className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs transition hover:bg-[var(--color-bg-subtle)]"
                  >
                    <span className="font-mono font-bold text-emerald-500">+</span>
                    <span className="truncate text-[var(--color-text-muted)]">
                      {edge.action}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Source changes */}
          <div className="border-r border-[var(--color-border)] p-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
              Source changes
            </div>
            <ul className="space-y-1">
              {changedFiles.map((file) => (
                <li
                  key={file.file}
                  className="flex items-center gap-2 rounded px-2 py-1 text-xs"
                >
                  <FileCode2 size={12} className="text-[var(--color-text-subtle)]" />
                  <span className="truncate font-mono text-[11px] text-[var(--color-text)]">
                    {file.file}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Runtime verification */}
          <div className="p-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
              Runtime verification
            </div>
            <ul className="space-y-1 text-xs">
              <Verify ok label="Settings → Battery" />
              <Verify ok label="Battery → Battery health" />
              <Verify ok label="Healthy state rendered" />
              <Verify ok label="Diagnostics action available" />
            </ul>
            <div className="mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="font-mono">Pixel 8</span> · Android 16 · all steps green
            </div>
          </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Verify({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
          ok
            ? "bg-emerald-500/15 text-emerald-500"
            : "bg-rose-500/15 text-rose-500"
        }`}
      >
        <Check size={9} strokeWidth={3} />
      </span>
      <span className="text-[var(--color-text-muted)]">{label}</span>
    </li>
  );
}
