import { describe, it, expect } from 'vitest';
import { calculateStreak } from '../../../src/features/habits/streaks/domain/StreakEngine';

describe('StreakEngine Pure Domain Math', () => {
  const TODAY = '2026-11-18';
  const YESTERDAY = '2026-11-17';
  const TWO_DAYS_AGO = '2026-11-16';

  it('evaluates unstarted habits with zero completions (US2-S5)', () => {
    const summary = calculateStreak('h-1', [], TODAY);
    expect(summary.currentStreak).toBe(0);
    expect(summary.bestStreak).toBe(0);
    expect(summary.lastCompletedDate).toBeNull();
    expect(summary.status).toBe('UNSTARTED');
  });

  it('evaluates active streak when completed today (T0)', () => {
    // Completed today and yesterday
    const completions = [TODAY, YESTERDAY, TWO_DAYS_AGO];
    const summary = calculateStreak('h-1', completions, TODAY);

    expect(summary.currentStreak).toBe(3);
    expect(summary.bestStreak).toBe(3);
    expect(summary.lastCompletedDate).toBe(TODAY);
    expect(summary.status).toBe('ACTIVE');
  });

  it('evaluates pending today streak without penalty when completed yesterday (FR-007, US2-S2)', () => {
    // Completed yesterday and two days ago, but NOT today
    const completions = [YESTERDAY, TWO_DAYS_AGO];
    const summary = calculateStreak('h-1', completions, TODAY);

    expect(summary.currentStreak).toBe(2);
    expect(summary.bestStreak).toBe(2);
    expect(summary.lastCompletedDate).toBe(YESTERDAY);
    expect(summary.status).toBe('PENDING_TODAY');
  });

  it('resets current streak to 0 when broken while preserving best streak (FR-008, US2-S3, US2-S4)', () => {
    // Completed 4 days in a row in the past, missed yesterday and today
    const pastRun = ['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13'];
    const summary = calculateStreak('h-1', pastRun, TODAY);

    expect(summary.currentStreak).toBe(0);
    expect(summary.bestStreak).toBe(4);
    expect(summary.lastCompletedDate).toBe('2026-11-13');
    expect(summary.status).toBe('BROKEN');
  });

  it('correctly tracks all-time best streak across multiple historical runs', () => {
    // Run 1: 5 days (Nov 1 - Nov 5)
    // Run 2: 2 days (Nov 8 - Nov 9)
    // Run 3: 3 days (Nov 16 - Nov 18, active today)
    const completions = [
      '2026-11-01',
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-08',
      '2026-11-09',
      '2026-11-16',
      '2026-11-17',
      '2026-11-18',
    ];

    const summary = calculateStreak('h-1', completions, TODAY);
    expect(summary.currentStreak).toBe(3);
    expect(summary.bestStreak).toBe(5);
    expect(summary.status).toBe('ACTIVE');
  });

  it('handles unordered and duplicate dates deterministically', () => {
    const unorganized = [TODAY, YESTERDAY, TODAY, YESTERDAY, TWO_DAYS_AGO];
    const summary = calculateStreak('h-1', unorganized, TODAY);

    expect(summary.currentStreak).toBe(3);
    expect(summary.bestStreak).toBe(3);
  });
});
