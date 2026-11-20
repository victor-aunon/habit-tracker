/**
 * Pure Monthly Calendar Matrix Generator Engine
 *
 * Produces 35 or 42 calendar grid cells starting on Monday with status projections.
 */

import type { DayCompletionStatus, HabitDayDetail } from './DayCompletionStatus';
import { resolveDayStatus } from './DayCompletionStatus';
import type { Habit } from '../../tracking/domain/Habit';
import {
  addDays,
  startOfWeekMonday,
  localDateToday,
  isFutureDate,
} from '../../../../core/domain/DateUtils';

export interface GenerateMatrixOptions {
  readonly year: number;
  readonly month: number; // 1-12
  readonly activeHabits: Habit[];
  readonly completionMap: Map<string, string[]>; // date -> Array of completed habitIds
  readonly referenceDate?: string;
}

function padTwo(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function generateMonthlyMatrix({
  year,
  month,
  activeHabits,
  completionMap,
  referenceDate,
}: GenerateMatrixOptions): DayCompletionStatus[] {
  const refDate = referenceDate ?? localDateToday();
  const firstOfMonth = `${year}-${padTwo(month)}-01`;
  const gridStart = startOfWeekMonday(firstOfMonth);

  // Determine grid size: 35 or 42
  const candidateEnd35 = addDays(gridStart, 34);
  const candidateMonth35 = Number.parseInt(candidateEnd35.slice(5, 7), 10);
  const totalCells = candidateMonth35 === month ? 42 : 35;

  const cells: DayCompletionStatus[] = [];

  for (let i = 0; i < totalCells; i++) {
    const cellDate = addDays(gridStart, i);
    const cellMonth = Number.parseInt(cellDate.slice(5, 7), 10);
    const isCurrentMonth = cellMonth === month;
    const isFuture = isFutureDate(cellDate, refDate);

    // Habits active on this calendar date (only habits created on or before this date)
    const trackedHabits = activeHabits.filter((h) => {
      const createdDate = h.createdAt ? h.createdAt.slice(0, 10) : '';
      return Boolean(createdDate) && createdDate <= cellDate;
    });

    const completedHabitIds = new Set(completionMap.get(cellDate) ?? []);
    const habitBreakdown: HabitDayDetail[] = trackedHabits.map((h) => ({
      habitId: h.id,
      title: h.title,
      isCompleted: completedHabitIds.has(h.id),
    }));

    const completedCount = isFuture ? 0 : habitBreakdown.filter((item) => item.isCompleted).length;
    const status = resolveDayStatus(completedCount, trackedHabits.length);

    cells.push({
      date: cellDate,
      status,
      completedCount,
      totalHabitsTracked: trackedHabits.length,
      habitBreakdown,
      isCurrentMonth,
      isFuture,
    });
  }

  return cells;
}
