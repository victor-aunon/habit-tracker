import { describe, it, expect } from 'vitest';
import { resolveStreakMilestone } from '../../../src/features/habits/streaks/domain/StreakMilestones';

describe('StreakMilestones Domain Logic', () => {
  it('identifies unstarted and daily streaks (1-6 days)', () => {
    const unstarted = resolveStreakMilestone(0);
    expect(unstarted.tier).toBe('UNSTARTED');

    const day1 = resolveStreakMilestone(1, 'Reading');
    expect(day1.tier).toBe('DAILY');
    expect(day1.isWeeklyMilestone).toBe(false);
    expect(day1.isMonthlyMilestone).toBe(false);
    expect(day1.celebrationMessage).toBeNull();

    const day6 = resolveStreakMilestone(6, 'Reading');
    expect(day6.tier).toBe('DAILY');
    expect(day6.weeks).toBe(0);
  });

  it('elevates to WEEKLY tier at 7 days and triggers weekly milestone celebration', () => {
    const day7 = resolveStreakMilestone(7, 'Workout');
    expect(day7.tier).toBe('WEEKLY');
    expect(day7.label).toContain('1 wk strong');
    expect(day7.weeks).toBe(1);
    expect(day7.isWeeklyMilestone).toBe(true);
    expect(day7.celebrationMessage).toContain('1-Week Streak');
    expect(day7.celebrationMessage).toContain('Workout');

    const day10 = resolveStreakMilestone(10, 'Workout');
    expect(day10.tier).toBe('WEEKLY');
    expect(day10.weeks).toBe(1);
    expect(day10.isWeeklyMilestone).toBe(false); // Day 10 is mid-week

    const day14 = resolveStreakMilestone(14, 'Workout');
    expect(day14.tier).toBe('WEEKLY');
    expect(day14.weeks).toBe(2);
    expect(day14.label).toContain('2 wks strong');
    expect(day14.isWeeklyMilestone).toBe(true);
  });

  it('elevates to MONTHLY tier at 30 days and triggers monthly mastery milestone', () => {
    const day30 = resolveStreakMilestone(30, 'Meditation');
    expect(day30.tier).toBe('MONTHLY');
    expect(day30.label).toContain('1 mo master');
    expect(day30.months).toBe(1);
    expect(day30.isMonthlyMilestone).toBe(true);
    expect(day30.celebrationMessage).toContain('1-Month Master');
    expect(day30.celebrationMessage).toContain('Meditation');

    const day60 = resolveStreakMilestone(60, 'Meditation');
    expect(day60.tier).toBe('MONTHLY');
    expect(day60.months).toBe(2);
    expect(day60.label).toContain('2 mos master');
    expect(day60.isMonthlyMilestone).toBe(true);
  });
});
