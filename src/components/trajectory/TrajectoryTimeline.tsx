import { trajectories } from "../../data/trajectories";
import { useAppStore } from "../../store/useAppStore";
import { baselineGraph } from "../../data/baselineGraph";
import { batteryHealthPatch } from "../../data/batteryHealthPatch";
import { applyGraphPatch } from "../../graph/applyGraphPatch";

export function TrajectoryTimeline() {
  const branch = useAppStore((s) => s.branch);
  const player = useAppStore((s) => s.trajectoryPlayer);
  const setStep = useAppStore((s) => s.setTrajectoryStep);

  const graph =
    branch === "feature/battery-health"
      ? applyGraphPatch(baselineGraph, batteryHealthPatch)
      : baselineGraph;

  const traj = trajectories.find((t) => t.id === player.trajectoryId);
  if (!traj) return null;

  return (
    <div className="flex shrink-0 flex-col gap-1 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2.5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--color-text-subtle)]">
        Trajectory
        <span className="font-medium text-[var(--color-text-muted)]">{traj.name}</span>
        <span className="ml-auto text-[var(--color-text-subtle)]">
          {traj.device} · {traj.androidVersion}
        </span>
      </div>
      <div className="flex items-center gap-1 overflow-x-auto">
        {traj.steps.map((step, idx) => {
          const node = graph.nodes.find((n) => n.id === step.nodeId);
          const active = idx === player.currentStepIndex;
          return (
            <button
              key={step.id}
              onClick={() => setStep(idx)}
              className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition ${
                active
                  ? "border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)]"
              }`}
            >
              <span className="font-mono text-[10px] opacity-70">
                {(step.timestampMs / 1000).toFixed(0).padStart(2, "0")}s
              </span>
              <span className="truncate">{node?.name ?? step.nodeId}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
