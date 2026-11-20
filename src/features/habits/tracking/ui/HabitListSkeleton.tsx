export function HabitListSkeleton() {
  return (
    <div role="status" aria-label="Loading habits" className="space-y-3">
      {[1, 2, 3].map((key) => (
        <div
          key={key}
          className="flex animate-pulse items-center gap-4 rounded-xl border border-border bg-surface p-4"
        >
          <div className="h-9 w-9 rounded-xl bg-surface-elevated" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-24 rounded bg-surface-elevated" />
            <div className="h-4 w-48 rounded bg-surface-elevated" />
          </div>
          <div className="h-8 w-8 rounded-lg bg-surface-elevated" />
        </div>
      ))}
      <span className="sr-only">Loading habit list...</span>
    </div>
  );
}
