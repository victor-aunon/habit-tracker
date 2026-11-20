import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Habit } from '../domain/Habit';
import type { StreakSummary } from '../../streaks/domain/StreakSummary';
import { HabitCard } from './HabitCard';
import { HabitEmptyState } from './HabitEmptyState';
import { HabitListSkeleton } from './HabitListSkeleton';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { ErrorBoundary } from '../../../../core/ui/ErrorBoundary';

export interface HabitListProps {
  readonly habits: Habit[];
  readonly streaks: Map<string, StreakSummary>;
  readonly completionMap: Map<string, boolean>;
  readonly isLoading: boolean;
  readonly onToggleHabit: (habitId: string) => void;
  readonly onDeleteHabit: (habitId: string) => void;
  readonly onOpenCreateModal: () => void;
  readonly newlyCreatedHabitId?: string | null;
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
}: HabitListProps) {
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  if (isLoading) {
    return <HabitListSkeleton />;
  }

  const completedCount = habits.filter((h) => completionMap.get(h.id) === true).length;
  const totalCount = habits.length;

  const handleConfirmDelete = () => {
    if (habitToDelete) {
      onDeleteHabit(habitToDelete.id);
      setHabitToDelete(null);
    }
  };

  return (
    <div data-testid="main-dashboard" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Today's Habits</h1>
          <p className="mt-1 text-sm text-text-muted">
            {totalCount > 0
              ? `${completedCount} of ${totalCount} completed today`
              : 'Form consistent routines, one day at a time.'}
          </p>
        </div>

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
                onToggle={onToggleHabit}
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
