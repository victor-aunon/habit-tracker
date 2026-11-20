import { PlusCircle } from 'lucide-react';

export interface HabitEmptyStateProps {
  readonly onOpenCreateModal: () => void;
}

export function HabitEmptyState({ onOpenCreateModal }: HabitEmptyStateProps) {
  return (
    <div
      data-testid="empty-state-dashboard"
      className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-subtle p-8 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
        <PlusCircle className="h-6 w-6" aria-hidden="true" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-text">No habits tracked yet</h3>
      <p className="mt-1 max-w-sm text-sm text-text-muted">
        Start building consistency today. Define your first daily habit to track streaks and weekly
        analytics.
      </p>

      <button
        type="button"
        onClick={onOpenCreateModal}
        data-testid="habit-create-button"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <PlusCircle className="h-4 w-4" aria-hidden="true" />
        Create your first habit
      </button>
    </div>
  );
}
