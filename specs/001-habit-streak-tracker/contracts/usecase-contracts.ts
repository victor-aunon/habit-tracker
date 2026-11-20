/**
 * Application Use Case Contracts & Commands/Queries
 *
 * Defines the public interfaces for habit tracking, streak calculation,
 * calendar history projections, and weekly analytics operations.
 */

import type { Habit, HabitCategory } from '@/features/habits/tracking/domain/Habit';
import type { StreakSummary } from '@/features/habits/streaks/domain/StreakSummary';
import type { DayCompletionStatus } from '@/features/habits/calendar-history/domain/DayCompletionStatus';
import type { WeeklyAnalyticsAggregate } from '@/features/habits/weekly-analytics/domain/WeeklyAnalyticsAggregate';
import type { StorageOperationResult } from '@/core/domain/StorageOperationResult';

// ----------------------------------------------------------------------------
// Commands (Write Operations)
// ----------------------------------------------------------------------------

export interface CreateHabitCommand {
  readonly title: string;
  readonly description?: string | null;
  readonly category?: HabitCategory;
}

export interface ToggleCompletionCommand {
  readonly habitId: string;
  readonly date?: string; // YYYY-MM-DD, defaults to today in local timezone
}

export interface DeleteHabitCommand {
  readonly habitId: string;
}

// ----------------------------------------------------------------------------
// Queries (Read Operations)
// ----------------------------------------------------------------------------

export interface GetCalendarMatrixQuery {
  readonly year: number;
  readonly month: number; // 1-12
}

export interface GetWeeklyAnalyticsQuery {
  readonly referenceDate?: string; // YYYY-MM-DD, defaults to current date
}

// ----------------------------------------------------------------------------
// Application Service Contracts
// ----------------------------------------------------------------------------

export interface IHabitTrackingService {
  getActiveHabits(): Promise<StorageOperationResult<Habit[]>>;
  createHabit(command: CreateHabitCommand): Promise<StorageOperationResult<Habit>>;
  toggleCompletion(command: ToggleCompletionCommand): Promise<StorageOperationResult<boolean>>;
  deleteHabit(command: DeleteHabitCommand): Promise<StorageOperationResult<boolean>>;
  isHabitCompletedToday(habitId: string): Promise<boolean>;
}

export interface IStreakCalculatorService {
  calculateStreakForHabit(habitId: string, referenceDate?: string): Promise<StreakSummary>;
  calculateStreaksForAllActive(referenceDate?: string): Promise<Map<string, StreakSummary>>;
}

export interface ICalendarHistoryService {
  getMonthlyMatrix(query: GetCalendarMatrixQuery): Promise<DayCompletionStatus[]>;
  getDayDetails(date: string): Promise<DayCompletionStatus>;
}

export interface IWeeklyAnalyticsService {
  getWeeklySummary(query?: GetWeeklyAnalyticsQuery): Promise<WeeklyAnalyticsAggregate>;
  getHistoricalWeeks(count: number): Promise<WeeklyAnalyticsAggregate[]>;
}
