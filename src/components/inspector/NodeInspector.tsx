import { Play, ArrowDownToLine, ArrowUpFromLine, Image as ImageIcon } from "lucide-react";
import type { AppGraph, AppNode } from "../../types/appGraph";
import {
  entryPaths,
  incomingEdges,
  outgoingEdges,
} from "../../graph/graphSelectors";
import { useAppStore } from "../../store/useAppStore";
import { trajectories } from "../../data/trajectories";
import { StatusBadge } from "../common/StatusBadge";
import { ChangeBadge } from "../common/ChangeBadge";
import { SourceReferences } from "./SourceReferences";

export function InspectorNodeView({
  node,
  graph,
}: {
  node: AppNode;
  graph: AppGraph;
}) {
  const selectEdge = useAppStore((s) => s.selectEdge);
  const selectNode = useAppStore((s) => s.selectNode);
  const startTrajectory = useAppStore((s) => s.startTrajectory);

  const entries = entryPaths(graph, node.id);
  const outs = outgoingEdges(graph, node.id);
  const ins = incomingEdges(graph, node.id);

  const runtime = node.runtimeRefs[0];
  const relatedTrajectory = runtime
    ? trajectories.find((t) => t.id === runtime.trajectoryId)
    : undefined;

  const childStates = graph.nodes.filter(
    (n) => n.parentId === node.id && n.type === "state",
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            {node.name}
          </h2>
          <ChangeBadge changeType={node.changeType} />
        </div>
        <div className="mt-0.5 text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
          {node.type === "app" ? "App root" : node.type}
        </div>
      </div>

      {node.description && (
        <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
          {node.description}
        </p>
      )}

      {/* Runtime */}
      <Section title="Runtime">
        <div className="flex items-center justify-between">
          <StatusBadge status={node.verificationStatus} />
          {runtime && (
            <span className="text-[11px] text-[var(--color-text-subtle)]">
              {runtime.device} · {runtime.androidVersion}
            </span>
          )}
        </div>
        {runtime && (
          <div className="mt-1.5 text-[11px] text-[var(--color-text-subtle)]">
            Last observed 12 minutes ago
          </div>
        )}
      </Section>

      {/* Screenshot */}
      {node.screenshots.length > 0 && (
        <Section title="Evidence">
          <div className="space-y-2">
            {node.screenshots.map((sc) => (
              <button
                key={sc.id}
                className="flex w-full items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-2 text-left text-xs transition hover:border-[var(--color-border-strong)]"
              >
                <ImageIcon size={12} className="text-[var(--color-text-subtle)]" />
                <span className="text-[var(--color-text)]">{sc.label}</span>
                <span className="ml-auto text-[10px] text-[var(--color-text-subtle)]">
                  Screenshot
                </span>
              </button>
            ))}
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-[11px] text-[var(--color-text-muted)]">
              Semantics tree captured · Device trajectory available
            </div>
          </div>
        </Section>
      )}

      {/* Source */}
      <Section title="Source">
        <SourceReferences refs={node.sourceRefs} />
      </Section>

      {/* States */}
      {childStates.length > 0 && (
        <Section title="States">
          <ul className="space-y-1">
            {childStates.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => selectNode(s.id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-[var(--color-bg-subtle)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-state)]" />
                  <span className="italic text-[var(--color-text)]">{s.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Entry paths */}
      {entries.length > 0 && (
        <Section title="Entry paths">
          <ul className="space-y-1">
            {entries.map((p, i) => (
              <li
                key={i}
                className="rounded-md bg-[var(--color-bg-subtle)] px-2 py-1.5 text-[11px] text-[var(--color-text-muted)]"
              >
                {p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Transitions */}
      {(ins.length > 0 || outs.length > 0) && (
        <Section title="Transitions">
          <div className="space-y-2">
            {ins.length > 0 && (
              <div>
                <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                  <ArrowDownToLine size={10} /> Incoming
                </div>
                <ul className="space-y-0.5">
                  {ins.map((e) => (
                    <li key={e.id}>
                      <button
                        onClick={() => selectEdge(e.id)}
                        className="w-full truncate rounded px-2 py-1 text-left text-[11px] text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]"
                      >
                        {graph.nodes.find((n) => n.id === e.from)?.name} →{" "}
                        <span className="italic">{e.action}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {outs.length > 0 && (
              <div>
                <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                  <ArrowUpFromLine size={10} /> Outgoing
                </div>
                <ul className="space-y-0.5">
                  {outs.map((e) => (
                    <li key={e.id}>
                      <button
                        onClick={() => selectEdge(e.id)}
                        className="w-full truncate rounded px-2 py-1 text-left text-[11px] text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]"
                      >
                        <span className="italic">{e.action}</span> →{" "}
                        {graph.nodes.find((n) => n.id === e.to)?.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Replay */}
      {relatedTrajectory && (
        <button
          onClick={() => startTrajectory(relatedTrajectory.id)}
          className="mt-1 flex items-center justify-center gap-2 rounded-md border border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] py-2 text-xs font-semibold text-[var(--color-accent)] transition hover:brightness-110"
        >
          <Play size={13} fill="currentColor" />
          Replay trajectory
        </button>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
        {title}
      </h3>
      {children}
    </section>
  );
}
