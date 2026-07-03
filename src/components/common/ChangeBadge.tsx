import type { ChangeType } from "../../types/appGraph";
import { Plus, Minus, Pencil, AlertTriangle } from "lucide-react";

const config: Record<
  ChangeType,
  { label: string; icon: typeof Plus | null; cls: string }
> = {
  unchanged: { label: "", icon: null, cls: "" },
  added: {
    label: "Added",
    icon: Plus,
    cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  modified: {
    label: "Modified",
    icon: Pencil,
    cls: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  removed: {
    label: "Removed",
    icon: Minus,
    cls: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30",
  },
};

export function ChangeBadge({ changeType }: { changeType: ChangeType }) {
  if (changeType === "unchanged") return null;
  const c = config[changeType];
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${c.cls}`}
    >
      {Icon && <Icon size={10} strokeWidth={2.5} />}
      {c.label}
    </span>
  );
}

export function ChangeMark({ changeType }: { changeType: ChangeType }) {
  if (changeType === "unchanged") return null;
  const mark = changeType === "added" ? "+" : changeType === "removed" ? "−" : "~";
  const cls =
    changeType === "added"
      ? "text-emerald-500"
      : changeType === "removed"
        ? "text-rose-500"
        : "text-amber-500";
  return (
    <span className={`font-mono text-sm font-bold leading-none ${cls}`}>{mark}</span>
  );
}

export function VerificationMark({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-emerald-500" title="Observed">
      ●
    </span>
  ) : (
    <span className="text-zinc-400" title="Source only">
      ○
    </span>
  );
}

export function WarningMark() {
  return (
    <AlertTriangle
      size={12}
      className="text-amber-500"
      strokeWidth={2.5}
    />
  );
}
