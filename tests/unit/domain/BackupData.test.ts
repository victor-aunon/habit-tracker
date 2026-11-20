import { describe, it, expect } from 'vitest';
import {
  createBackupPayload,
  validateBackupPayload,
  type HabitBackupPayload,
} from '../../../src/features/habits/backup/domain/BackupData';
import { createHabit } from '../../../src/features/habits/tracking/domain/Habit';
import type { CompletionRecord } from '../../../src/features/habits/tracking/domain/CompletionRecord';

describe('BackupData Domain', () => {
  const sampleHabits = [
    createHabit({
      id: 'h-1',
      title: 'Exercise',
      description: 'Morning gym',
      category: 'fitness',
      createdAt: '2026-11-01T08:00:00.000Z',
    }),
  ];

  const sampleCompletions: CompletionRecord[] = [
    {
      id: 'c-1',
      habitId: 'h-1',
      date: '2026-11-01',
      completedAt: '2026-11-01T09:00:00.000Z',
    },
  ];

  it('creates a valid backup payload with metadata', () => {
    const payload = createBackupPayload(sampleHabits, sampleCompletions);

    expect(payload.version).toBe(1);
    expect(typeof payload.exportedAt).toBe('string');
    expect(payload.habits).toHaveLength(1);
    expect(payload.habits[0].id).toBe('h-1');
    expect(payload.completions).toHaveLength(1);
    expect(payload.completions[0].id).toBe('c-1');
  });

  it('validates a correct payload successfully', () => {
    const validData: HabitBackupPayload = {
      version: 1,
      exportedAt: '2026-11-19T10:00:00.000Z',
      habits: sampleHabits,
      completions: sampleCompletions,
    };

    const result = validateBackupPayload(validData);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.habits).toHaveLength(1);
      expect(result.data.completions).toHaveLength(1);
    }
  });

  it('rejects non-object or null input', () => {
    expect(validateBackupPayload(null).valid).toBe(false);
    expect(validateBackupPayload('string').valid).toBe(false);
    expect(validateBackupPayload(123).valid).toBe(false);
  });

  it('rejects unsupported or missing version', () => {
    const invalidVersion = {
      version: 2,
      exportedAt: '2026-11-19T10:00:00.000Z',
      habits: [],
      completions: [],
    };
    const res = validateBackupPayload(invalidVersion);
    expect(res.valid).toBe(false);
    if (!res.valid) {
      expect(res.error).toContain('version');
    }
  });

  it('rejects payloads where habits or completions are not arrays', () => {
    const invalidHabits = {
      version: 1,
      exportedAt: '2026-11-19T10:00:00.000Z',
      habits: 'not-an-array',
      completions: [],
    };
    expect(validateBackupPayload(invalidHabits).valid).toBe(false);

    const invalidCompletions = {
      version: 1,
      exportedAt: '2026-11-19T10:00:00.000Z',
      habits: [],
      completions: 'not-an-array',
    };
    expect(validateBackupPayload(invalidCompletions).valid).toBe(false);
  });

  it('rejects habit items with missing required fields or invalid types', () => {
    const invalidItem = {
      version: 1,
      exportedAt: '2026-11-19T10:00:00.000Z',
      habits: [{ id: 'h-1' }], // missing title, createdAt, etc.
      completions: [],
    };
    const res = validateBackupPayload(invalidItem);
    expect(res.valid).toBe(false);
  });

  it('rejects completion items with missing required fields or invalid date format', () => {
    const invalidRecord = {
      version: 1,
      exportedAt: '2026-11-19T10:00:00.000Z',
      habits: sampleHabits,
      completions: [{ id: 'c-1', habitId: 'h-1', date: 'invalid-date' }],
    };
    const res = validateBackupPayload(invalidRecord);
    expect(res.valid).toBe(false);
  });
});
