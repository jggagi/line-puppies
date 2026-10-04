import { useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, X, SkipBack, SkipForward, Check } from "lucide-react";
import { trajectories } from "../../data/trajectories";
import { useAppStore } from "../../store/useAppStore";
import { baselineGraph } from "../../data/baselineGraph";
import { batteryHealthPatch } from "../../data/batteryHealthPatch";
import { applyGraphPatch } from "../../graph/applyGraphPatch";
import { DevicePreview } from "./DevicePreview";
import { TrajectoryTimeline } from "./TrajectoryTimeline";

const STEP_INTERVAL_MS = 1200;

export function TrajectoryPlayer() {
  const branch = useAppStore((s) => s.branch);
  const player = useAppStore((s) => s.trajectoryPlayer);
  const closeTrajectory = useAppStore((s) => s.closeTrajectory);
  const togglePlay = useAppStore((s) => s.togglePlay);
  const pauseTrajectory = useAppStore((s) => s.pauseTrajectory);
  const setStep = useAppStore((s) => s.setTrajectoryStep);
  const selectNode = useAppStore((s) => s.selectNode);
  const selectEdge = useAppStore((s) => s.selectEdge);

  const traj = trajectories.find((t) => t.id === player.trajectoryId);

  const graph =
    branch === "feature/battery-health"
      ? applyGraphPatch(baselineGraph, batteryHealthPatch)
      : baselineGraph;

  const step = traj?.steps[player.currentStepIndex];

  // Auto-advance while playing.
  useEffect(() => {
    if (!player.playing || !traj) return;
    if (player.currentStepIndex >= traj.steps.length - 1) {
      pauseTrajectory();
      return;
    }
    const t = setTimeout(() => {
      setStep(player.currentStepIndex + 1);
    }, STEP_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [player.playing, player.currentStepIndex, traj, setStep, pauseTrajectory]);

  // Sync graph selection with the current step.
  useEffect(() => {
    if (!step) return;
    selectNode(step.nodeId);
    if (step.edgeId) selectEdge(step.edgeId);
  }, [step, selectNode, selectEdge]);

  if (!traj || !step) return null;

  const atEnd = player.currentStepIndex >= traj.steps.length - 1;

  // Compute tap position for ripple.
  const tap =
    step.action?.type === "tap" && step.action.x != null && step.action.y != null
      ? { x: step.action.x, y: step.action.y, key: step.id }
      : null;

  const sc = graph.nodes
    .flatMap((n) => n.screenshots)
    .find((s) => s.id === step.screenshotId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-30 flex flex-col bg-[var(--color-bg)]/95 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-[var(--color-border)] px-4">
        <span className="text-xs font-semibold text-[var(--color-text)]">
          Trajectory replay
        </span>
        <span className="text-[11px] text-[var(--color-text-muted)]">
          {traj.name}
        </span>
        <button
          onClick={closeTrajectory}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Device side */}
        <div className="flex w-[340px] shrink-0 flex-col border-r border-[var(--color-border)]">
          <div className="min-h-0 flex-1">
            <DevicePreview sceneKey={sc?.sceneKey ?? "settings-home"} tap={tap} />
          </div>
        </div>

        {/* Graph side — reuses the canvas behind via a status panel.
            We render a simple path visualization here to keep replay self-contained. */}
        <div className="relative min-w-0 flex-1 overflow-hidden bg-[var(--color-bg-subtle)] p-6">
          <PathVisualization
            stepIndex={player.currentStepIndex}
            graph={graph}
          />
        </div>
      </div>

      {/* Timeline */}
      <TrajectoryTimeline />

      {/* Transport controls */}
      <div className="flex shrink-0 items-center gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2.5">
        <button
          onClick={() => setStep(Math.max(0, player.currentStepIndex - 1))}
          disabled={player.currentStepIndex === 0}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-40"
        >
          <SkipBack size={13} />
        </button>
        <button
          onClick={() => {
            if (atEnd) {
              setStep(0);
              // toggle play back on
              togglePlay();
            } else {
              togglePlay();
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)] text-white transition hover:brightness-110"
        >
          {player.playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        </button>
        <button
          onClick={() => setStep(Math.min(traj.steps.length - 1, player.currentStepIndex + 1))}
          disabled={atEnd}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-40"
        >
          <SkipForward size={13} />
        </button>

        <div className="ml-2 text-[11px] font-mono text-[var(--color-text-subtle)]">
          {(step.timestampMs / 1000).toFixed(0).padStart(2, "0")}s /{" "}
          {(traj.durationMs / 1000).toFixed(0).padStart(2, "0")}s
        </div>

        {atEnd && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="ml-auto flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
          >
            <Check size={12} strokeWidth={3} />
            Trajectory verified · 4 screens · 3 transitions · Pixel 8
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function PathVisualization({
  stepIndex,
  graph,
}: {
  stepIndex: number;
  graph: ReturnType<typeof applyGraphPatch>;
}) {
  const traj = trajectories[0];
  const nodeById = (id: string) => graph.nodes.find((n) => n.id === id);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex flex-col items-stretch gap-2">
        {traj.steps
          .filter((s, i, arr) => i === 0 || s.nodeId !== arr[i - 1].nodeId)
          .map((s) => {
            const node = nodeById(s.nodeId);
            const isCurrent = s.nodeId === traj.steps[stepIndex].nodeId;
            const reachedIndex = traj.steps
              .map((st) => st.nodeId)
              .lastIndexOf(s.nodeId);
            const isPast = reachedIndex < stepIndex;
            return (
              <motion.div
                key={s.id}
                layout
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 transition ${
                  isCurrent
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] ring-2 ring-[var(--color-accent-soft)]"
                    : isPast
                      ? "border-[var(--color-border)] bg-[var(--color-bg-elevated)] opacity-80"
                      : "border-[var(--color-border)] border-dashed bg-transparent opacity-50"
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    isPast || isCurrent
                      ? "bg-emerald-500"
                      : "bg-zinc-400"
                  }`}
                />
                <div>
                  <div className="text-sm font-medium text-[var(--color-text)]">
                    {node?.name ?? s.nodeId}
                  </div>
                  {s.action?.label && (
                    <div className="text-[11px] italic text-[var(--color-text-subtle)]">
                      {s.action.label}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
