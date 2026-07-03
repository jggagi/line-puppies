import type { ReactNode } from "react";

export function ThreePaneLayout({
  left,
  center,
  right,
  bottom,
}: {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  bottom?: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1">
        <aside className="w-64 shrink-0 overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
          {left}
        </aside>
        <main className="relative min-w-0 flex-1 overflow-hidden bg-[var(--color-bg)]">
          {center}
        </main>
        <aside className="w-80 shrink-0 overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
          {right}
        </aside>
      </div>
      {bottom}
    </div>
  );
}
