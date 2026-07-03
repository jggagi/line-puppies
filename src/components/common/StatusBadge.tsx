import type { VerificationStatus } from "../../types/appGraph";

const config: Record<
  VerificationStatus,
  { label: string; dot: string; cls: string }
> = {
  "source-only": {
    label: "Source only",
    dot: "bg-zinc-400",
    cls: "text-zinc-500 dark:text-zinc-400",
  },
  observed: {
    label: "Observed",
    dot: "bg-sky-500",
    cls: "text-sky-600 dark:text-sky-400",
  },
  verified: {
    label: "Verified",
    dot: "bg-emerald-500",
    cls: "text-emerald-600 dark:text-emerald-400",
  },
  failed: {
    label: "Failed",
    dot: "bg-rose-500",
    cls: "text-rose-600 dark:text-rose-400",
  },
};

export function StatusBadge({
  status,
  compact = false,
}: {
  status: VerificationStatus;
  compact?: boolean;
}) {
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${c.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {!compact && c.label}
    </span>
  );
}
