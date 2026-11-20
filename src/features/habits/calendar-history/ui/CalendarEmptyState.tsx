import { CalendarDays } from 'lucide-react';

export function CalendarEmptyState() {
  return (
    <div
      data-testid="empty-state-calendar"
      className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-subtle p-8 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
        <CalendarDays className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-text">No calendar history</h3>
      <p className="mt-1 max-w-sm text-sm text-text-muted">
        Create habits and log daily completions to view your monthly consistency calendar.
      </p>
    </div>
  );
}
