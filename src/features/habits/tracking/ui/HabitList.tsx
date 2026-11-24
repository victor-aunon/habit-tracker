import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Habit } from '../domain/Habit';
import type { StreakSummary } from '../../streaks/domain/StreakSummary';
import { HabitCard } from './HabitCard';
import { HabitEmptyState } from './HabitEmptyState';
import { HabitListSkeleton } from './HabitListSkeleton';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { ErrorBoundary } from '../../../../core/ui/ErrorBoundary';
import { addDays, localDateToday } from '../../../../core/domain/DateUtils';

export interface HabitListProps {
  readonly habits: Habit[];
  readonly streaks: Map<string, StreakSummary>;
  readonly completionMap: Map<string, boolean>;
  readonly isLoading: boolean;
  readonly onToggleHabit: (habitId: string, date?: string) => void;
  readonly onDeleteHabit: (habitId: string) => void;
  readonly onOpenCreateModal: () => void;
  readonly newlyCreatedHabitId?: string | null;
  readonly selectedDate?: string;
  readonly onSelectDate?: (date: string) => void;
}

export function HabitList({
  habits,
  streaks,
  completionMap,
  isLoading,
  onToggleHabit,
  onDeleteHabit,
  onOpenCreateModal,
  newlyCreatedHabitId,
  selectedDate,
  onSelectDate,
}: HabitListProps) {
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  if (isLoading) {
    return <HabitListSkeleton />;
  }

  const today = localDateToday();
  const currentDate = selectedDate ?? today;
  const isToday = currentDate === today;
  const yesterday = addDays(today, -1);
  const isYesterday = currentDate === yesterday;

  const completedCount = habits.filter((h) => completionMap.get(h.id) === true).length;
  const totalCount = habits.length;

  const handleConfirmDelete = () => {
    if (habitToDelete) {
      onDeleteHabit(habitToDelete.id);
      setHabitToDelete(null);
    }
  };

  const getHeadingText = () => {
    if (isToday) return "Today's Habits";
    if (isYesterday) return `Yesterday's Habits (${currentDate})`;
    return `Habits for ${currentDate}`;
  };

  const getSubheadingText = () => {
    if (totalCount === 0) return 'Form consistent routines, one day at a time.';
    if (isToday) return `${completedCount} of ${totalCount} completed today`;
    return `${completedCount} of ${totalCount} completed on ${currentDate}`;
  };

  return (
    <div data-testid="main-dashboard" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">{getHeadingText()}</h1>
          <p className="mt-1 text-sm text-text-muted">{getSubheadingText()}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date navigation controls */}
          <div className="flex items-center rounded-xl border border-border bg-surface p-1 shadow-sm">
            <button
              type="button"
              onClick={() => onSelectDate?.(addDays(currentDate, -1))}
              data-testid="prev-day-btn"
              aria-label="Previous day"
              className="rounded-lg p-1.5 text-text-muted hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <label className="relative flex items-center px-2 cursor-pointer">
              <span className="text-xs font-semibold text-text sm:text-sm">
                {isToday ? 'Today' : isYesterday ? 'Yesterday' : currentDate}
              </span>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => {
                  if (e.target.value) onSelectDate?.(e.target.value);
                }}
                data-testid="dashboard-date-picker"
                aria-label="Select date"
                className="sr-only"
              />
            </label>

            <button
              type="button"
              onClick={() => onSelectDate?.(addDays(currentDate, 1))}
              data-testid="next-day-btn"
              aria-label="Next day"
              className="rounded-lg p-1.5 text-text-muted hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {!isToday && (
            <button
              type="button"
              onClick={() => onSelectDate?.(today)}
              data-testid="dashboard-today-btn"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-text shadow-sm hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Today
            </button>
          )}

          {totalCount > 0 && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              data-testid="habit-create-button"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Habit
            </button>
          )}
        </div>
      </div>

      <ErrorBoundary fallbackMessage="Unable to render habits list. Please try again.">
        {totalCount === 0 ? (
          <HabitEmptyState onOpenCreateModal={onOpenCreateModal} />
        ) : (
          <div className="grid gap-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                streak={streaks.get(habit.id)}
                isCompletedToday={completionMap.get(habit.id) === true}
                onToggle={(id) =>
                  selectedDate ? onToggleHabit(id, selectedDate) : onToggleHabit(id)
                }
                onRequestDelete={() => setHabitToDelete(habit)}
                isNew={newlyCreatedHabitId === habit.id}
              />
            ))}
          </div>
        )}
      </ErrorBoundary>

      <DeleteConfirmationDialog
        isOpen={habitToDelete !== null}
        habitTitle={habitToDelete?.title ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setHabitToDelete(null)}
      />
    </div>
  );
}
