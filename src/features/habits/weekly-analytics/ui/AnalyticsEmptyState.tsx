import { BarChart3 } from 'lucide-react';

export function AnalyticsEmptyState() {
  return (
    <div
      data-testid="empty-state-analytics"
      className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-subtle p-8 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
        <BarChart3 className="h-6 w-6" aria-hidden="true" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-text">No completions this week</h3>
      <p className="mt-1 max-w-sm text-sm text-text-muted">
        Log habit completions throughout the week to generate consistency rates and daily
        distribution insights.
      </p>
    </div>
  );
}
