import { useMemo } from 'react';
import { X, CheckCircle2, CircleDashed } from 'lucide-react';
import type { DayCompletionStatus, HabitDayDetail } from '../domain/DayCompletionStatus';
import type { Habit } from '../../tracking/domain/Habit';

export interface DayDetailInspectionProps {
  readonly date: string;
  readonly dayStatus: DayCompletionStatus | null;
  readonly onClose: () => void;
  readonly onToggleHabit?: (habitId: string, date: string) => void;
  readonly activeHabits?: Habit[];
}

export function DayDetailInspection({
  date,
  dayStatus,
  onClose,
  onToggleHabit,
  activeHabits,
}: DayDetailInspectionProps) {
  if (!dayStatus) return null;

  const items: HabitDayDetail[] = useMemo(() => {
    if (!activeHabits || activeHabits.length === 0) {
      return dayStatus.habitBreakdown;
    }
    const completedIds = new Set(
      dayStatus.habitBreakdown.filter((h) => h.isCompleted).map((h) => h.habitId),
    );
    return activeHabits.map((h) => ({
      habitId: h.id,
      title: h.title,
      isCompleted: completedIds.has(h.id),
    }));
  }, [dayStatus.habitBreakdown, activeHabits]);

  const completedItems = items.filter((h) => h.isCompleted);
  const missedItems = items.filter((h) => !h.isCompleted);
  const totalCount = items.length;

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
            {completedItems.length} of {totalCount} habits completed
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
        {totalCount === 0 ? (
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
                      className="flex items-center justify-between rounded-lg bg-success-subtle/40 px-3 py-2 text-xs font-medium text-text"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          data-testid={`toggle-day-habit-${habit.habitId}`}
                          onClick={() => onToggleHabit?.(habit.habitId, date)}
                          disabled={!onToggleHabit}
                          aria-label={`Unmark ${habit.title} for ${date}`}
                          className="rounded p-0.5 text-success hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="truncate">{habit.title}</span>
                      </div>
                      {onToggleHabit && (
                        <button
                          type="button"
                          onClick={() => onToggleHabit(habit.habitId, date)}
                          className="text-[11px] font-normal text-text-muted hover:text-text hover:underline"
                        >
                          Unmark
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {missedItems.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-danger">
                  Missed / Incomplete ({missedItems.length})
                </h4>
                <ul className="mt-1.5 space-y-1.5">
                  {missedItems.map((habit) => (
                    <li
                      key={habit.habitId}
                      className="flex items-center justify-between rounded-lg bg-danger-subtle/30 px-3 py-2 text-xs font-medium text-text"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          data-testid={`toggle-day-habit-${habit.habitId}`}
                          onClick={() => onToggleHabit?.(habit.habitId, date)}
                          disabled={!onToggleHabit}
                          aria-label={`Mark ${habit.title} as completed for ${date}`}
                          className="rounded p-0.5 text-danger hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <CircleDashed className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="truncate">{habit.title}</span>
                      </div>
                      {onToggleHabit && (
                        <button
                          type="button"
                          onClick={() => onToggleHabit(habit.habitId, date)}
                          className="text-[11px] font-semibold text-primary hover:underline"
                        >
                          Mark Done
                        </button>
                      )}
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
