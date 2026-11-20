import { Trash2, Sparkles } from 'lucide-react';
import type { Habit } from '../domain/Habit';
import type { StreakSummary } from '../../streaks/domain/StreakSummary';
import { CompletionToggle } from './CompletionToggle';
import { StreakBadge } from '../../streaks/ui/StreakBadge';

export interface HabitCardProps {
  readonly habit: Habit;
  readonly streak?: StreakSummary;
  readonly isCompletedToday: boolean;
  readonly onToggle: (habitId: string) => void;
  readonly onRequestDelete?: (habitId: string) => void;
  readonly isNew?: boolean;
}

const CATEGORY_STYLES: Record<string, string> = {
  health: 'bg-success-subtle text-success border-success/30',
  fitness: 'bg-primary-subtle text-primary border-primary/30',
  productivity: 'bg-streak-fire-subtle text-streak-fire border-streak-fire/30',
  mindfulness: 'bg-warning-subtle text-warning border-warning/30',
  learning: 'bg-info-subtle text-info border-info/30',
  other: 'bg-surface-elevated text-text-muted border-border',
};

export function HabitCard({
  habit,
  streak,
  isCompletedToday,
  onToggle,
  onRequestDelete,
  isNew = false,
}: HabitCardProps) {
  const categoryStyle = CATEGORY_STYLES[habit.category] ?? CATEGORY_STYLES.other;
  const isMonthlyTier = Boolean(streak && streak.currentStreak >= 30);
  const isWeeklyTier = Boolean(streak && streak.currentStreak >= 7 && streak.currentStreak < 30);

  const cardBorderClass = isNew
    ? 'border-primary/60 ring-2 ring-primary/25 shadow-lg shadow-primary/10 animate-new-habit'
    : isCompletedToday
      ? isMonthlyTier
        ? 'border-streak-gold/45 bg-surface/95 shadow-sm shadow-streak-gold/15'
        : isWeeklyTier
          ? 'border-streak-fire/40 bg-surface/95 shadow-sm shadow-streak-fire/15'
          : 'border-success/35 bg-surface/95 shadow-sm shadow-success/15'
      : isMonthlyTier
        ? 'border-streak-gold/30 bg-surface hover:border-streak-gold/50'
        : isWeeklyTier
          ? 'border-streak-fire/25 bg-surface hover:border-streak-fire/45'
          : 'border-border bg-surface hover:border-text-secondary/40';

  return (
    <div
      data-testid="habit-card"
      className={`group relative flex items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 hover:bg-surface-hover ${cardBorderClass}`}
    >
      <div className="flex flex-1 items-center gap-4 min-w-0">
        <CompletionToggle
          isCompleted={isCompletedToday}
          onToggle={() => onToggle(habit.id)}
          habitTitle={habit.title}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${categoryStyle}`}
            >
              {habit.category}
            </span>

            {isNew && (
              <span
                data-testid="new-habit-badge"
                className="inline-flex items-center gap-1 rounded-md border border-primary/50 bg-primary-subtle px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-primary animate-badge-shimmer"
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                NEW
              </span>
            )}

            {streak && (
              <StreakBadge
                currentStreak={streak.currentStreak}
                bestStreak={streak.bestStreak}
                status={streak.status}
              />
            )}
          </div>

          <h3
            data-testid="habit-title"
            className={`mt-1 truncate text-base font-semibold transition-colors ${
              isCompletedToday ? 'text-text-muted line-through' : 'text-text'
            }`}
          >
            {habit.title}
          </h3>

          {habit.description && (
            <p className="mt-0.5 truncate text-xs text-text-muted">{habit.description}</p>
          )}
        </div>
      </div>

      {onRequestDelete && (
        <button
          type="button"
          onClick={() => onRequestDelete(habit.id)}
          data-testid="habit-delete-button"
          aria-label={`Delete ${habit.title}`}
          className="rounded-lg p-2 text-text-muted opacity-80 transition-opacity hover:bg-danger-subtle hover:text-danger focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
