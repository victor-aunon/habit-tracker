/**
 * Streak Service Port Interface
 */

import type { StreakSummary } from '../domain/StreakSummary';

export interface IStreakCalculatorService {
  calculateStreakForHabit(habitId: string, referenceDate?: string): Promise<StreakSummary>;
  calculateStreaksForAllActive(referenceDate?: string): Promise<Map<string, StreakSummary>>;
}
