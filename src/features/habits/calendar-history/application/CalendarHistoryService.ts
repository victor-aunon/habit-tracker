/**
 * Calendar History Application Service
 *
 * Queries monthly matrices and day detail breakdowns.
 */

import type { DayCompletionStatus } from '../domain/DayCompletionStatus';
import { generateMonthlyMatrix } from '../domain/CalendarMatrixEngine';
import type {
  IHabitRepository,
  ICompletionLogRepository,
} from '../../tracking/application/HabitRepositoryPort';

export interface GetCalendarMatrixQuery {
  readonly year: number;
  readonly month: number; // 1-12
}

export interface ICalendarHistoryService {
  getMonthlyMatrix(query: GetCalendarMatrixQuery): Promise<DayCompletionStatus[]>;
  getDayDetails(date: string): Promise<DayCompletionStatus>;
}

export class CalendarHistoryService implements ICalendarHistoryService {
  public constructor(
    private readonly habitRepo: IHabitRepository,
    private readonly completionRepo: ICompletionLogRepository,
  ) {}

  public async getMonthlyMatrix(query: GetCalendarMatrixQuery): Promise<DayCompletionStatus[]> {
    const habitsResult = await this.habitRepo.getAllActive();
    const activeHabits = habitsResult.data ?? [];

    const logsResult = await this.completionRepo.getByDateRange('2000-01-01', '2100-12-31');
    const logs = logsResult.data ?? [];

    const completionMap = new Map<string, string[]>();
    for (const log of logs) {
      const list = completionMap.get(log.date) ?? [];
      list.push(log.habitId);
      completionMap.set(log.date, list);
    }

    return generateMonthlyMatrix({
      year: query.year,
      month: query.month,
      activeHabits,
      completionMap,
    });
  }

  public async getDayDetails(date: string): Promise<DayCompletionStatus> {
    const year = Number.parseInt(date.slice(0, 4), 10);
    const month = Number.parseInt(date.slice(5, 7), 10);
    const matrix = await this.getMonthlyMatrix({ year, month });
    const day = matrix.find((d) => d.date === date);

    if (!day) {
      throw new Error(`Date '${date}' not found in calendar matrix.`);
    }

    return day;
  }
}
