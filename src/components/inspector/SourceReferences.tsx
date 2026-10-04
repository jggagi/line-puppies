import { FileCode2 } from "lucide-react";
import type { SourceRef } from "../../types/appGraph";

export function SourceReferences({ refs }: { refs: SourceRef[] }) {
  if (refs.length === 0) {
    return (
      <div className="text-xs text-[var(--color-text-subtle)] italic">
        No source references
      </div>
    );
  }
  return (
    <ul className="space-y-1">
      {refs.map((ref, i) => (
        <li
          key={`${ref.file}-${i}`}
          className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 text-xs transition hover:border-[var(--color-border-strong)]"
        >
          <FileCode2 size={12} className="shrink-0 text-[var(--color-text-subtle)]" />
          <span className="truncate font-mono text-[11px] text-[var(--color-text)]">
            {ref.file}
            {ref.symbol ? ` · ${ref.symbol}` : ""}
            {ref.line ? `:${ref.line}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
