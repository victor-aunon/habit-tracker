/**
 * Streak Calculator Application Service
 *
 * Coordinates streak evaluation across habit repository and completion records.
 */

import type { IStreakCalculatorService } from '../application/StreakServicePort';
import type { StreakSummary } from '../domain/StreakSummary';
import { calculateStreak } from '../domain/StreakEngine';
import type {
  IHabitRepository,
  ICompletionLogRepository,
} from '../../tracking/application/HabitRepositoryPort';

export interface IStreakServicePort {
  calculateStreakForHabit(habitId: string, referenceDate?: string): Promise<StreakSummary>;
  calculateStreaksForAllActive(referenceDate?: string): Promise<Map<string, StreakSummary>>;
}

export class StreakService implements IStreakCalculatorService {
  public constructor(
    private readonly habitRepo: IHabitRepository,
    private readonly completionRepo: ICompletionLogRepository,
  ) {}

  public async calculateStreakForHabit(
    habitId: string,
    referenceDate?: string,
  ): Promise<StreakSummary> {
    const logsResult = await this.completionRepo.getByHabitId(habitId);
    const dates = (logsResult.data ?? []).map((r) => r.date);
    return calculateStreak(habitId, dates, referenceDate);
  }

  public async calculateStreaksForAllActive(
    referenceDate?: string,
  ): Promise<Map<string, StreakSummary>> {
    const habitsResult = await this.habitRepo.getAllActive();
    const habits = habitsResult.data ?? [];
    const resultMap = new Map<string, StreakSummary>();

    for (const habit of habits) {
      const summary = await this.calculateStreakForHabit(habit.id, referenceDate);
      resultMap.set(habit.id, summary);
    }

    return resultMap;
  }
}
