export function AnalyticsSkeleton() {
  return (
    <div role="status" aria-label="Loading analytics" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="h-28 animate-pulse rounded-2xl border border-border bg-surface p-5"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface p-6" />
      <span className="sr-only">Loading analytics...</span>
    </div>
  );
}
