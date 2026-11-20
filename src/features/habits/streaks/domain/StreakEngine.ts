/**
 * Pure Stateless Streak Calculation Engine
 *
 * Computes current streak, best streak, and streak status from historical completion dates.
 */

import type { StreakSummary, StreakStatus } from './StreakSummary';
import { addDays, localDateToday } from '../../../../core/domain/DateUtils';

function deduplicateAndSortAsc(dates: string[]): string[] {
  return Array.from(new Set(dates)).sort((a, b) => a.localeCompare(b));
}

function computeCurrentStreak(
  dateSet: Set<string>,
  today: string,
  yesterday: string,
): { currentStreak: number; status: StreakStatus } {
  const completedToday = dateSet.has(today);
  const completedYesterday = dateSet.has(yesterday);

  if (!completedToday && !completedYesterday) {
    const status: StreakStatus = dateSet.size === 0 ? 'UNSTARTED' : 'BROKEN';
    return { currentStreak: 0, status };
  }

  let streak = 0;
  let checkDate = completedToday ? today : yesterday;

  while (dateSet.has(checkDate)) {
    streak += 1;
    checkDate = addDays(checkDate, -1);
  }

  const status: StreakStatus = completedToday ? 'ACTIVE' : 'PENDING_TODAY';
  return { currentStreak: streak, status };
}

function computeBestStreak(sortedAsc: string[], currentStreak: number): number {
  if (sortedAsc.length === 0) {
    return 0;
  }

  let longestRun = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = sortedAsc[i - 1];
    const curr = sortedAsc[i];
    const expected = addDays(prev, 1);

    if (curr === expected) {
      currentRun += 1;
      if (currentRun > longestRun) {
        longestRun = currentRun;
      }
    } else {
      currentRun = 1;
    }
  }

  return Math.max(longestRun, currentStreak);
}

export function calculateStreak(
  habitId: string,
  rawDates: string[],
  referenceDate?: string,
): StreakSummary {
  const today = referenceDate ?? localDateToday();
  const yesterday = addDays(today, -1);

  const sortedAsc = deduplicateAndSortAsc(rawDates);
  const dateSet = new Set(sortedAsc);

  const { currentStreak, status } = computeCurrentStreak(dateSet, today, yesterday);
  const bestStreak = computeBestStreak(sortedAsc, currentStreak);
  const lastCompletedDate = sortedAsc.length > 0 ? sortedAsc[sortedAsc.length - 1] : null;

  return {
    habitId,
    currentStreak,
    bestStreak,
    lastCompletedDate,
    status,
  };
}
