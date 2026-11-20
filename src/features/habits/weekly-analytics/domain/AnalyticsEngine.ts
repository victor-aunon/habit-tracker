/**
 * Pure 7-Day Weekly Analytics Calculation Engine
 *
 * Evaluates completion rates (e.g. 14/21 = 67%) and handles mid-week habit inception.
 */

import type { WeeklyAnalyticsAggregate, DayOfWeek } from './WeeklyAnalyticsAggregate';
import { DAYS_OF_WEEK } from './WeeklyAnalyticsAggregate';
import type { Habit } from '../../tracking/domain/Habit';
import type { CompletionRecord } from '../../tracking/domain/CompletionRecord';
import { addDays, endOfWeekSunday } from '../../../../core/domain/DateUtils';

export interface CalculateWeeklyOptions {
  readonly weekStartDate: string; // Monday
  readonly activeHabits: Habit[];
  readonly completions: CompletionRecord[];
}

function createEmptyDailyDistribution(): Record<DayOfWeek, number> {
  return {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };
}

function calculateWeeklyOpportunities(
  weekStartDate: string,
  activeHabits: Habit[],
): {
  dateToDayOfWeek: Map<string, DayOfWeek>;
  totalOpportunities: number;
} {
  const dateToDayOfWeek = new Map<string, DayOfWeek>();
  let totalOpportunities = 0;

  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(weekStartDate, i);
    const dayName = DAYS_OF_WEEK[i];
    dateToDayOfWeek.set(dayDate, dayName);

    const eligibleCount = activeHabits.filter((h) => {
      const createdDate = h.createdAt.slice(0, 10);
      return createdDate <= dayDate;
    }).length;

    totalOpportunities += eligibleCount;
  }

  return { dateToDayOfWeek, totalOpportunities };
}

function aggregateCompletions(
  completions: CompletionRecord[],
  dateToDayOfWeek: Map<string, DayOfWeek>,
): { dailyDistribution: Record<DayOfWeek, number>; totalCompleted: number } {
  const dailyDistribution = createEmptyDailyDistribution();
  let totalCompleted = 0;

  for (const record of completions) {
    const dayName = dateToDayOfWeek.get(record.date);
    if (dayName) {
      dailyDistribution[dayName] += 1;
      totalCompleted += 1;
    }
  }

  return { dailyDistribution, totalCompleted };
}

function findMostConsistentDay(
  dailyDistribution: Record<DayOfWeek, number>,
  totalCompleted: number,
): DayOfWeek | null {
  if (totalCompleted === 0) {
    return null;
  }

  let topDay: DayOfWeek | null = null;
  let topCount = 0;

  for (const day of DAYS_OF_WEEK) {
    if (dailyDistribution[day] > topCount) {
      topCount = dailyDistribution[day];
      topDay = day;
    }
  }

  return topDay;
}

export function calculateWeeklyAnalytics({
  weekStartDate,
  activeHabits,
  completions,
}: CalculateWeeklyOptions): WeeklyAnalyticsAggregate {
  const weekEndDate = endOfWeekSunday(weekStartDate);
  const { dateToDayOfWeek, totalOpportunities } = calculateWeeklyOpportunities(
    weekStartDate,
    activeHabits,
  );
  const { dailyDistribution, totalCompleted } = aggregateCompletions(completions, dateToDayOfWeek);

  const completionRatePercentage =
    totalOpportunities === 0 ? 0 : Math.round((totalCompleted / totalOpportunities) * 100);

  const mostConsistentDay = findMostConsistentDay(dailyDistribution, totalCompleted);

  return {
    weekStartDate,
    weekEndDate,
    totalOpportunities,
    totalCompleted,
    completionRatePercentage,
    dailyDistribution,
    mostConsistentDay,
    hasCompletions: totalCompleted > 0,
  };
}
