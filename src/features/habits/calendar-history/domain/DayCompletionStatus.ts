/**
 * Day Completion Status Value Object & Detail Types
 *
 * Matrix cell projection representing aggregated habit performance for a specific calendar date.
 */

export type DayStatus = 'ALL_COMPLETED' | 'PARTIALLY_COMPLETED' | 'NONE_COMPLETED' | 'NO_HABITS';

export interface HabitDayDetail {
  readonly habitId: string;
  readonly title: string;
  readonly isCompleted: boolean;
}

export interface DayCompletionStatus {
  readonly date: string; // YYYY-MM-DD
  readonly status: DayStatus;
  readonly completedCount: number;
  readonly totalHabitsTracked: number;
  readonly habitBreakdown: HabitDayDetail[];
  readonly isCurrentMonth: boolean;
  readonly isFuture: boolean;
}

export function resolveDayStatus(completedCount: number, totalHabitsTracked: number): DayStatus {
  if (totalHabitsTracked === 0) return 'NO_HABITS';
  if (completedCount === totalHabitsTracked) return 'ALL_COMPLETED';
  if (completedCount > 0) return 'PARTIALLY_COMPLETED';
  return 'NONE_COMPLETED';
}
