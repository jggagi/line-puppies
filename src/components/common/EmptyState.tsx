import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      {icon && (
        <div className="text-zinc-300 dark:text-zinc-600">{icon}</div>
      )}
      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {title}
      </div>
      {description && (
        <div className="max-w-xs text-xs text-zinc-500 dark:text-zinc-500">
          {description}
        </div>
      )}
      {action}
    </div>
  );
}
