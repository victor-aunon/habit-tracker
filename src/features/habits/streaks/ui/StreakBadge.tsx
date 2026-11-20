import { Flame, Trophy, Crown } from 'lucide-react';
import type { StreakStatus } from '../domain/StreakSummary';
import { resolveStreakMilestone } from '../domain/StreakMilestones';

export interface StreakBadgeProps {
  readonly currentStreak: number;
  readonly bestStreak: number;
  readonly status: StreakStatus;
  readonly className?: string;
}

export function StreakBadge({
  currentStreak,
  bestStreak,
  status,
  className = '',
}: StreakBadgeProps) {
  const isPending = status === 'PENDING_TODAY';
  const isActive = status === 'ACTIVE';
  const milestone = resolveStreakMilestone(currentStreak);

  const isWeekly = milestone.tier === 'WEEKLY';
  const isMonthly = milestone.tier === 'MONTHLY';

  return (
    <div
      className={`inline-flex items-center gap-2 text-xs font-mono font-medium ${className}`}
      aria-label={`Streak: ${currentStreak} days current, best ${bestStreak} days`}
    >
      <span
        data-testid="streak-current-badge"
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 border transition-all duration-200 ${
          isMonthly
            ? 'border-streak-gold/50 bg-streak-gold-subtle text-streak-gold shadow-sm shadow-streak-gold/10'
            : isWeekly
              ? 'border-streak-fire/50 bg-streak-fire-subtle text-streak-fire shadow-sm shadow-streak-fire/10'
              : isActive
                ? 'border-streak-fire/30 bg-streak-fire-subtle text-streak-fire'
                : isPending
                  ? 'border-warning/30 bg-warning-subtle text-warning'
                  : 'border-border bg-surface-subtle text-text-muted'
        }`}
      >
        {isMonthly ? (
          <Crown
            className="h-3.5 w-3.5 text-streak-gold animate-mastery-radiance"
            aria-hidden="true"
          />
        ) : (
          <Flame
            className={`h-3.5 w-3.5 ${isWeekly ? 'animate-ember-glow text-streak-fire' : ''}`}
            aria-hidden="true"
          />
        )}
        <span>
          {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          {isPending && ' (pending)'}
        </span>

        {isWeekly && (
          <span className="rounded bg-streak-fire/20 px-1 py-0.2 text-[10px] font-bold uppercase tracking-wider text-streak-fire">
            {milestone.label}
          </span>
        )}

        {isMonthly && (
          <span className="rounded bg-streak-gold/25 px-1 py-0.2 text-[10px] font-bold uppercase tracking-wider text-streak-gold">
            {milestone.label}
          </span>
        )}
      </span>

      {bestStreak > 0 && (
        <span
          data-testid="streak-best-badge"
          className="inline-flex items-center gap-1 rounded-md border border-streak-gold/30 bg-streak-gold-subtle px-2 py-0.5 text-streak-gold"
          title={`All-time best streak: ${bestStreak} days`}
        >
          <Trophy className="h-3 w-3" aria-hidden="true" />
          <span>Best: {bestStreak}</span>
        </span>
      )}
    </div>
  );
}
