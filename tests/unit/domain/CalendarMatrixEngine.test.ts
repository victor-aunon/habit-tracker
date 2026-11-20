import { describe, it, expect } from 'vitest';
import { generateMonthlyMatrix } from '../../../src/features/habits/calendar-history/domain/CalendarMatrixEngine';
import { createHabit } from '../../../src/features/habits/tracking/domain/Habit';

describe('CalendarMatrixEngine', () => {
  it('generates a grid starting on Monday with 35 or 42 cells', () => {
    // November 2026: Nov 1 is Sunday.
    // Monday start: Oct 26 is Monday. 5 weeks = 35 days (Oct 26 - Nov 29), so Nov 30 requires a 6th week = 42 cells.
    const habits = [
      createHabit({ id: 'h-1', title: 'Exercise', createdAt: '2026-11-01T00:00:00.000Z' }),
    ];
    const completionMap = new Map<string, string[]>();

    const matrix = generateMonthlyMatrix({
      year: 2026,
      month: 11,
      activeHabits: habits,
      completionMap,
      referenceDate: '2026-11-18',
    });

    expect([35, 42]).toContain(matrix.length);
    // First cell must be a Monday
    const firstCellDate = new Date(`${matrix[0].date}T12:00:00Z`);
    expect(firstCellDate.getUTCDay()).toBe(1); // 1 = Monday
  });

  it('correctly assigns completion statuses', () => {
    const h1 = createHabit({
      id: 'h-1',
      title: 'Drink Water',
      createdAt: '2026-11-01T00:00:00.000Z',
    });
    const h2 = createHabit({ id: 'h-2', title: 'Walk', createdAt: '2026-11-01T00:00:00.000Z' });
    const habits = [h1, h2];

    const completionMap = new Map<string, string[]>();
    // Nov 18: both completed
    completionMap.set('2026-11-18', ['h-1', 'h-2']);
    // Nov 17: only h-1 completed
    completionMap.set('2026-11-17', ['h-1']);
    // Nov 16: none completed
    completionMap.set('2026-11-16', []);

    const matrix = generateMonthlyMatrix({
      year: 2026,
      month: 11,
      activeHabits: habits,
      completionMap,
      referenceDate: '2026-11-18',
    });

    const day18 = matrix.find((d) => d.date === '2026-11-18');
    expect(day18?.status).toBe('ALL_COMPLETED');
    expect(day18?.completedCount).toBe(2);
    expect(day18?.totalHabitsTracked).toBe(2);

    const day17 = matrix.find((d) => d.date === '2026-11-17');
    expect(day17?.status).toBe('PARTIALLY_COMPLETED');
    expect(day17?.completedCount).toBe(1);

    const day16 = matrix.find((d) => d.date === '2026-11-16');
    expect(day16?.status).toBe('NONE_COMPLETED');
    expect(day16?.completedCount).toBe(0);
  });

  it('resolves NO_HABITS when 0 habits are active', () => {
    const matrix = generateMonthlyMatrix({
      year: 2026,
      month: 11,
      activeHabits: [],
      completionMap: new Map(),
      referenceDate: '2026-11-18',
    });

    const day18 = matrix.find((d) => d.date === '2026-11-18');
    expect(day18?.status).toBe('NO_HABITS');
    expect(day18?.totalHabitsTracked).toBe(0);
  });

  it('does not track habits before their creation date (resolves NO_HABITS prior to createdAt)', () => {
    // Habit created on Thursday Nov 19, 2026
    const habit = createHabit({
      id: 'h-new',
      title: 'Habit Starting Nov 19',
      createdAt: '2026-11-19T08:00:00.000Z',
    });

    const matrix = generateMonthlyMatrix({
      year: 2026,
      month: 11,
      activeHabits: [habit],
      completionMap: new Map(),
      referenceDate: '2026-11-19',
    });

    // Days before Nov 19 (e.g. Nov 18, Nov 1, Oct 26) must NOT track this habit
    const day18 = matrix.find((d) => d.date === '2026-11-18');
    expect(day18?.status).toBe('NO_HABITS');
    expect(day18?.totalHabitsTracked).toBe(0);
    expect(day18?.habitBreakdown).toHaveLength(0);

    const day1 = matrix.find((d) => d.date === '2026-11-01');
    expect(day1?.status).toBe('NO_HABITS');
    expect(day1?.totalHabitsTracked).toBe(0);

    // Day of creation (Nov 19) starts tracking the habit
    const day19 = matrix.find((d) => d.date === '2026-11-19');
    expect(day19?.status).toBe('NONE_COMPLETED');
    expect(day19?.totalHabitsTracked).toBe(1);
    expect(day19?.habitBreakdown).toHaveLength(1);
  });

  it('tracks multiple habits progressively according to their individual creation dates', () => {
    const h1 = createHabit({ id: 'h-1', title: 'Habit 1', createdAt: '2026-11-05T00:00:00.000Z' });
    const h2 = createHabit({ id: 'h-2', title: 'Habit 2', createdAt: '2026-11-15T00:00:00.000Z' });

    const matrix = generateMonthlyMatrix({
      year: 2026,
      month: 11,
      activeHabits: [h1, h2],
      completionMap: new Map(),
      referenceDate: '2026-11-19',
    });

    const day4 = matrix.find((d) => d.date === '2026-11-04');
    expect(day4?.status).toBe('NO_HABITS');
    expect(day4?.totalHabitsTracked).toBe(0);

    const day10 = matrix.find((d) => d.date === '2026-11-10');
    expect(day10?.status).toBe('NONE_COMPLETED');
    expect(day10?.totalHabitsTracked).toBe(1);
    expect(day10?.habitBreakdown[0].habitId).toBe('h-1');

    const day16 = matrix.find((d) => d.date === '2026-11-16');
    expect(day16?.status).toBe('NONE_COMPLETED');
    expect(day16?.totalHabitsTracked).toBe(2);
  });
});
