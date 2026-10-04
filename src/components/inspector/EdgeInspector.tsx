import type { AppEdge, AppGraph } from "../../types/appGraph";
import { useAppStore } from "../../store/useAppStore";
import { ChangeBadge } from "../common/ChangeBadge";
import { SourceReferences } from "./SourceReferences";

export function InspectorEdgeView({
  edge,
  graph,
}: {
  edge: AppEdge;
  graph: AppGraph;
}) {
  const selectNode = useAppStore((s) => s.selectNode);
  const from = graph.nodes.find((n) => n.id === edge.from);
  const to = graph.nodes.find((n) => n.id === edge.to);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            {from?.name} → {to?.name}
          </h2>
          <ChangeBadge changeType={edge.changeType} />
        </div>
        <div className="mt-0.5 text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
          Transition
        </div>
      </div>

      <section>
        <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          Action
        </h3>
        <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-xs text-[var(--color-text)]">
          {edge.action}
        </div>
        <div className="mt-1.5 inline-flex rounded bg-[var(--color-bg-subtle)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">
          {edge.actionType}
        </div>
      </section>

      <section>
        <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          Runtime selector
        </h3>
        <code className="block rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1.5 font-mono text-[11px] text-[var(--color-text)]">
          {edge.selector ?? "—"}
        </code>
      </section>

      <section>
        <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          Endpoints
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => from && selectNode(from.id)}
            className="flex-1 truncate rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 text-left text-[var(--color-text)] transition hover:border-[var(--color-border-strong)]"
          >
            ← {from?.name}
          </button>
          <button
            onClick={() => to && selectNode(to.id)}
            className="flex-1 truncate rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 text-left text-[var(--color-text)] transition hover:border-[var(--color-border-strong)]"
          >
            {to?.name} →
          </button>
        </div>
      </section>

      <section>
        <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          Source
        </h3>
        <SourceReferences refs={edge.sourceRefs} />
      </section>

      <section>
        <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          Observed
        </h3>
        <div className="text-xs text-[var(--color-text-muted)]">
          {edge.observed ? (
            <span className="text-emerald-500">● Verified by Device Agent</span>
          ) : (
            <span className="text-zinc-400">○ Source-inferred, not yet executed</span>
          )}
        </div>
      </section>
    </div>
  );
}
