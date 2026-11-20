import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageHabitRepo } from '../../../src/features/habits/tracking/infrastructure/LocalStorageHabitRepo';
import { LocalStorageCompletionRepo } from '../../../src/features/habits/tracking/infrastructure/LocalStorageCompletionRepo';
import { createHabit } from '../../../src/features/habits/tracking/domain/Habit';

describe('LocalStorageHabitRepo', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    const storageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    };
    vi.stubGlobal('localStorage', storageMock);
  });

  it('saves and retrieves active habits', async () => {
    const repo = new LocalStorageHabitRepo();
    const habit = createHabit({ id: 'h-1', title: 'Read 30 Mins', category: 'learning' });

    const saveResult = await repo.save(habit);
    expect(saveResult.success).toBe(true);
    expect(saveResult.data).toEqual(habit);

    const activeResult = await repo.getAllActive();
    expect(activeResult.success).toBe(true);
    expect(activeResult.data).toHaveLength(1);
    expect(activeResult.data?.[0].title).toBe('Read 30 Mins');
  });

  it('detects existing normalized titles case-insensitively', async () => {
    const repo = new LocalStorageHabitRepo();
    await repo.save(createHabit({ id: 'h-1', title: 'Meditate' }));

    const exists = await repo.existsByNormalizedTitle('meditate');
    expect(exists).toBe(true);

    const existsUppercase = await repo.existsByNormalizedTitle('MEDITATE');
    expect(existsUppercase).toBe(true);

    const notExists = await repo.existsByNormalizedTitle('exercise');
    expect(notExists).toBe(false);
  });

  it('handles quota exhaustion by retaining in memory', async () => {
    const quotaError = new DOMException('Storage quota exceeded', 'QuotaExceededError');
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw quotaError;
    });

    const repo = new LocalStorageHabitRepo();
    const habit = createHabit({ id: 'h-quota', title: 'Drink Water' });

    const result = await repo.save(habit);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('QUOTA_EXCEEDED');
    expect(result.isRetainedInMemory).toBe(true);

    const active = await repo.getAllActive();
    expect(active.data).toHaveLength(1);
    expect(active.data?.[0].title).toBe('Drink Water');
  });

  it('soft deletes habits by setting isActive to false', async () => {
    const repo = new LocalStorageHabitRepo();
    const habit = createHabit({ id: 'h-del', title: 'To Delete' });
    await repo.save(habit);

    const delResult = await repo.delete('h-del');
    expect(delResult.success).toBe(true);

    const activeResult = await repo.getAllActive();
    expect(activeResult.data).toHaveLength(0);

    const raw = await repo.getById('h-del');
    expect(raw.data?.isActive).toBe(false);
  });
});

describe('LocalStorageCompletionRepo', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    const storageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    };
    vi.stubGlobal('localStorage', storageMock);
  });

  it('toggles completion status on and off', async () => {
    const repo = new LocalStorageCompletionRepo();

    const firstToggle = await repo.toggleCompletion('h-1', '2026-11-18');
    expect(firstToggle.success).toBe(true);
    expect(firstToggle.data).toBe(true); // Now completed

    const isDone = await repo.isCompleted('h-1', '2026-11-18');
    expect(isDone).toBe(true);

    const secondToggle = await repo.toggleCompletion('h-1', '2026-11-18');
    expect(secondToggle.success).toBe(true);
    expect(secondToggle.data).toBe(false); // Now toggled off

    const isDoneAfter = await repo.isCompleted('h-1', '2026-11-18');
    expect(isDoneAfter).toBe(false);
  });

  it('queries completions by date range', async () => {
    const repo = new LocalStorageCompletionRepo();
    await repo.toggleCompletion('h-1', '2026-11-16');
    await repo.toggleCompletion('h-1', '2026-11-17');
    await repo.toggleCompletion('h-1', '2026-11-18');
    await repo.toggleCompletion('h-1', '2026-11-20');

    const rangeResult = await repo.getByDateRange('2026-11-16', '2026-11-18');
    expect(rangeResult.success).toBe(true);
    expect(rangeResult.data).toHaveLength(3);
  });

  it('retains completions in memory on quota exhaustion', async () => {
    const quotaError = new DOMException('QuotaExceeded', 'QuotaExceededError');
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw quotaError;
    });

    const repo = new LocalStorageCompletionRepo();
    const result = await repo.toggleCompletion('h-1', '2026-11-18');

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('QUOTA_EXCEEDED');
    expect(result.isRetainedInMemory).toBe(true);
    expect(result.data).toBe(true);

    const isCompleted = await repo.isCompleted('h-1', '2026-11-18');
    expect(isCompleted).toBe(true);
  });
});
