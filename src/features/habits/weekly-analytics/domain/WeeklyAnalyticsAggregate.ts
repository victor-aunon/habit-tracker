/**
 * Weekly Analytics Aggregate Value Object
 *
 * Analytical projection evaluating performance over a 7-day calendar week (Monday - Sunday).
 */

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const DAYS_OF_WEEK: readonly DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export interface WeeklyAnalyticsAggregate {
  readonly weekStartDate: string; // Monday (YYYY-MM-DD)
  readonly weekEndDate: string; // Sunday (YYYY-MM-DD)
  readonly totalOpportunities: number;
  readonly totalCompleted: number;
  readonly completionRatePercentage: number; // 0 - 100
  readonly dailyDistribution: Record<DayOfWeek, number>;
  readonly mostConsistentDay: DayOfWeek | null;
  readonly hasCompletions: boolean;
}
