export function CalendarSkeleton() {
  return (
    <div role="status" aria-label="Loading calendar grid" className="space-y-4">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-elevated" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, idx) => (
          <div
            key={idx}
            className="h-18 animate-pulse rounded-xl border border-border bg-surface p-2"
          />
        ))}
      </div>
      <span className="sr-only">Loading calendar...</span>
    </div>
  );
}
