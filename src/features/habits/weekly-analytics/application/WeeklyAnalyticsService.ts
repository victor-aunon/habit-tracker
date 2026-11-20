/**
 * Weekly Analytics Application Service
 *
 * Implements use cases for weekly performance summaries and rolling history.
 */

import type { WeeklyAnalyticsAggregate } from '../domain/WeeklyAnalyticsAggregate';
import { calculateWeeklyAnalytics } from '../domain/AnalyticsEngine';
import type {
  IHabitRepository,
  ICompletionLogRepository,
} from '../../tracking/application/HabitRepositoryPort';
import {
  localDateToday,
  startOfWeekMonday,
  endOfWeekSunday,
  addDays,
} from '../../../../core/domain/DateUtils';

export interface GetWeeklyAnalyticsQuery {
  readonly referenceDate?: string;
}

export interface IWeeklyAnalyticsService {
  getWeeklySummary(query?: GetWeeklyAnalyticsQuery): Promise<WeeklyAnalyticsAggregate>;
  getHistoricalWeeks(count: number): Promise<WeeklyAnalyticsAggregate[]>;
}

export class WeeklyAnalyticsService implements IWeeklyAnalyticsService {
  public constructor(
    private readonly habitRepo: IHabitRepository,
    private readonly completionRepo: ICompletionLogRepository,
  ) {}

  public async getWeeklySummary(
    query?: GetWeeklyAnalyticsQuery,
  ): Promise<WeeklyAnalyticsAggregate> {
    const ref = query?.referenceDate ?? localDateToday();
    const monday = startOfWeekMonday(ref);
    const sunday = endOfWeekSunday(ref);

    const habitsResult = await this.habitRepo.getAllActive();
    const activeHabits = habitsResult.data ?? [];

    const completionsResult = await this.completionRepo.getByDateRange(monday, sunday);
    const completions = completionsResult.data ?? [];

    return calculateWeeklyAnalytics({
      weekStartDate: monday,
      activeHabits,
      completions,
    });
  }

  public async getHistoricalWeeks(count: number): Promise<WeeklyAnalyticsAggregate[]> {
    const summaries: WeeklyAnalyticsAggregate[] = [];
    const today = localDateToday();
    let currentMonday = startOfWeekMonday(today);

    for (let i = 0; i < count; i++) {
      const summary = await this.getWeeklySummary({ referenceDate: currentMonday });
      summaries.push(summary);
      currentMonday = addDays(currentMonday, -7);
    }

    return summaries;
  }
}
