import { GitBranch, Search, RotateCcw, Boxes, X } from "lucide-react";
import { useAppStore, type Branch, type ViewMode } from "../../store/useAppStore";

const branches: Branch[] = ["main", "feature/battery-health"];

const viewModes: Array<{ id: ViewMode; label: string }> = [
  { id: "product", label: "Product" },
  { id: "runtime", label: "Runtime" },
  { id: "change", label: "Change" },
];

export function AppHeader({ onResetLayout }: { onResetLayout: () => void }) {
  const branch = useAppStore((s) => s.branch);
  const viewMode = useAppStore((s) => s.viewMode);
  const setBranch = useAppStore((s) => s.setBranch);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <Boxes size={16} strokeWidth={2.2} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[13px] font-semibold text-[var(--color-text)]">
            Android Settings
          </span>
          <span className="text-[10px] text-[var(--color-text-subtle)]">
            App Graph
          </span>
        </div>
      </div>

      <div className="mx-1 h-6 w-px bg-[var(--color-border)]" />

      {/* Branch selector */}
      <div className="relative">
        <GitBranch
          size={13}
          className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]"
        />
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value as Branch)}
          className="h-8 appearance-none rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] pl-7 pr-7 text-xs font-medium text-[var(--color-text)] outline-none transition hover:border-[var(--color-border-strong)] focus:border-[var(--color-accent)]"
        >
          {branches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* View selector */}
      <div className="flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-0.5">
        {viewModes.map((v) => {
          const active = viewMode === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className={`h-7 rounded-[5px] px-3 text-xs font-medium transition ${
                active
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <Search
          size={13}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]"
        />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search screens, states…"
          className="h-8 w-56 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] pl-8 pr-7 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] outline-none transition hover:border-[var(--color-border-strong)] focus:border-[var(--color-accent)] focus:w-64"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] transition hover:text-[var(--color-text)]"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <button
        onClick={onResetLayout}
        title="Reset layout"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
      >
        <RotateCcw size={13} />
      </button>
    </header>
  );
}
