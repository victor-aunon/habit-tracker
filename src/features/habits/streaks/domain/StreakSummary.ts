/**
 * Streak Summary Value Object
 *
 * Calculated projection encapsulating streak metrics for a specific habit.
 */

export type StreakStatus = 'ACTIVE' | 'PENDING_TODAY' | 'BROKEN' | 'UNSTARTED';

export interface StreakSummary {
  readonly habitId: string;
  readonly currentStreak: number;
  readonly bestStreak: number;
  readonly lastCompletedDate: string | null;
  readonly status: StreakStatus;
}

export function createDefaultStreak(habitId: string): StreakSummary {
  return {
    habitId,
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    status: 'UNSTARTED',
  };
}
