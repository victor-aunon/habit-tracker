import { X, CheckCircle2, CircleDashed } from 'lucide-react';
import type { DayCompletionStatus } from '../domain/DayCompletionStatus';

export interface DayDetailInspectionProps {
  readonly date: string;
  readonly dayStatus: DayCompletionStatus | null;
  readonly onClose: () => void;
}

export function DayDetailInspection({ date, dayStatus, onClose }: DayDetailInspectionProps) {
  if (!dayStatus) return null;

  const completedItems = dayStatus.habitBreakdown.filter((h) => h.isCompleted);
  const missedItems = dayStatus.habitBreakdown.filter((h) => !h.isCompleted);

  return (
    <aside
      data-testid="day-detail-panel"
      role="region"
      aria-label={`Habit breakdown for ${date}`}
      className="rounded-2xl border border-border bg-surface p-5 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-base font-bold text-text">History for {date}</h3>
          <p className="text-xs text-text-muted">
            {dayStatus.completedCount} of {dayStatus.totalHabitsTracked} habits completed
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inspection panel"
          className="rounded-lg p-1 text-text-muted hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {dayStatus.totalHabitsTracked === 0 ? (
          <p className="py-4 text-center text-sm text-text-muted">No active habits on this date.</p>
        ) : (
          <>
            {completedItems.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-success">
                  Completed ({completedItems.length})
                </h4>
                <ul className="mt-1.5 space-y-1.5">
                  {completedItems.map((habit) => (
                    <li
                      key={habit.habitId}
                      className="flex items-center gap-2 rounded-lg bg-success-subtle/40 px-3 py-2 text-xs font-medium text-text"
                    >
                      <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                      <span>{habit.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {missedItems.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-danger">
                  Missed ({missedItems.length})
                </h4>
                <ul className="mt-1.5 space-y-1.5">
                  {missedItems.map((habit) => (
                    <li
                      key={habit.habitId}
                      className="flex items-center gap-2 rounded-lg bg-danger-subtle/30 px-3 py-2 text-xs font-medium text-text"
                    >
                      <CircleDashed className="h-4 w-4 text-danger" aria-hidden="true" />
                      <span>{habit.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
