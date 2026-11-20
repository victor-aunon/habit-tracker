import { describe, it, expect } from 'vitest';
import { calculateWeeklyAnalytics } from '../../../src/features/habits/weekly-analytics/domain/AnalyticsEngine';
import { createHabit } from '../../../src/features/habits/tracking/domain/Habit';
import type { CompletionRecord } from '../../../src/features/habits/tracking/domain/CompletionRecord';

describe('AnalyticsEngine Domain Math', () => {
  // Monday Nov 16 to Sunday Nov 22, 2026
  const WEEK_START = '2026-11-16'; // Monday

  it('calculates standard 14/21 = 67% weekly rate correctly (US4-S2)', () => {
    // 3 active habits created before the week starts -> 3 * 7 = 21 opportunities
    const habits = [
      createHabit({ id: 'h-1', title: 'H1', createdAt: '2026-11-01T00:00:00.000Z' }),
      createHabit({ id: 'h-2', title: 'H2', createdAt: '2026-11-01T00:00:00.000Z' }),
      createHabit({ id: 'h-3', title: 'H3', createdAt: '2026-11-01T00:00:00.000Z' }),
    ];

    // 14 completions across the week
    const completions: CompletionRecord[] = [];
    const days = [
      '2026-11-16',
      '2026-11-17',
      '2026-11-18',
      '2026-11-19',
      '2026-11-20',
      '2026-11-21',
      '2026-11-22',
    ];

    // 2 completions per day = 14 total
    for (const d of days) {
      completions.push({ id: `c-1-${d}`, habitId: 'h-1', date: d, completedAt: `${d}T10:00:00Z` });
      completions.push({ id: `c-2-${d}`, habitId: 'h-2', date: d, completedAt: `${d}T10:00:00Z` });
    }

    const aggregate = calculateWeeklyAnalytics({
      weekStartDate: WEEK_START,
      activeHabits: habits,
      completions,
    });

    expect(aggregate.totalOpportunities).toBe(21);
    expect(aggregate.totalCompleted).toBe(14);
    // round(14 / 21 * 100) = 67%
    expect(aggregate.completionRatePercentage).toBe(67);
    expect(aggregate.hasCompletions).toBe(true);
  });

  it('handles mid-week habit inception without penalizing earlier days (US4-S5)', () => {
    // Habit created on Thursday Nov 19 -> 4 active days in week (Thu, Fri, Sat, Sun)
    const habit = createHabit({
      id: 'h-midweek',
      title: 'New Habit',
      createdAt: '2026-11-19T08:00:00.000Z',
    });

    // Completed 3 times (Thu, Fri, Sat)
    const completions: CompletionRecord[] = [
      { id: 'c-1', habitId: 'h-midweek', date: '2026-11-19', completedAt: '2026-11-19T10:00:00Z' },
      { id: 'c-2', habitId: 'h-midweek', date: '2026-11-20', completedAt: '2026-11-20T10:00:00Z' },
      { id: 'c-3', habitId: 'h-midweek', date: '2026-11-21', completedAt: '2026-11-21T10:00:00Z' },
    ];

    const aggregate = calculateWeeklyAnalytics({
      weekStartDate: WEEK_START,
      activeHabits: [habit],
      completions,
    });

    // 4 opportunities (Nov 19, 20, 21, 22), 3 completed = 75%
    expect(aggregate.totalOpportunities).toBe(4);
    expect(aggregate.totalCompleted).toBe(3);
    expect(aggregate.completionRatePercentage).toBe(75);
  });

  it('evaluates zero completions safely without NaN', () => {
    const habit = createHabit({
      id: 'h-zero',
      title: 'Zero Habit',
      createdAt: '2026-11-01T00:00:00.000Z',
    });

    const aggregate = calculateWeeklyAnalytics({
      weekStartDate: WEEK_START,
      activeHabits: [habit],
      completions: [],
    });

    expect(aggregate.totalOpportunities).toBe(7);
    expect(aggregate.totalCompleted).toBe(0);
    expect(aggregate.completionRatePercentage).toBe(0);
    expect(aggregate.hasCompletions).toBe(false);
    expect(aggregate.mostConsistentDay).toBeNull();
  });

  it('determines the most consistent day of the week', () => {
    const habit = createHabit({
      id: 'h-1',
      title: 'H1',
      createdAt: '2026-11-01T00:00:00.000Z',
    });

    // 2 completions on Wednesday (2026-11-18)
    const completions: CompletionRecord[] = [
      { id: 'c-1', habitId: 'h-1', date: '2026-11-16', completedAt: '2026-11-16T10:00:00Z' }, // Mon
      { id: 'c-2', habitId: 'h-1', date: '2026-11-18', completedAt: '2026-11-18T10:00:00Z' }, // Wed
      { id: 'c-3', habitId: 'h-1', date: '2026-11-18', completedAt: '2026-11-18T12:00:00Z' }, // Wed
    ];

    const aggregate = calculateWeeklyAnalytics({
      weekStartDate: WEEK_START,
      activeHabits: [habit],
      completions,
    });

    expect(aggregate.dailyDistribution.Wednesday).toBe(2);
    expect(aggregate.dailyDistribution.Monday).toBe(1);
    expect(aggregate.mostConsistentDay).toBe('Wednesday');
  });
});
