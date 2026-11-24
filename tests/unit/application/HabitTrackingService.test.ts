import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HabitTrackingService } from '../../../src/features/habits/tracking/application/HabitTrackingService';
import { LocalStorageHabitRepo } from '../../../src/features/habits/tracking/infrastructure/LocalStorageHabitRepo';
import { LocalStorageCompletionRepo } from '../../../src/features/habits/tracking/infrastructure/LocalStorageCompletionRepo';

describe('HabitTrackingService', () => {
  let habitRepo: LocalStorageHabitRepo;
  let completionRepo: LocalStorageCompletionRepo;
  let service: HabitTrackingService;

  beforeEach(() => {
    const memoryStore: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => memoryStore[k] ?? null,
      setItem: (k: string, v: string) => {
        memoryStore[k] = v;
      },
      removeItem: (k: string) => {
        delete memoryStore[k];
      },
      clear: () => {},
    });

    habitRepo = new LocalStorageHabitRepo();
    completionRepo = new LocalStorageCompletionRepo();
    service = new HabitTrackingService(habitRepo, completionRepo);
  });

  it('creates a new habit and normalizes title', async () => {
    const result = await service.createHabit({
      title: '   Read Book   ',
      category: 'learning',
    });

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('Read Book');
    expect(result.data?.category).toBe('learning');

    const activeList = await service.getActiveHabits();
    expect(activeList.data).toHaveLength(1);
  });

  it('rejects duplicate habit titles case-insensitively (FR-020, US1-S6)', async () => {
    await service.createHabit({ title: 'Exercise' });

    const duplicateAttempt = await service.createHabit({ title: 'exercise' });
    expect(duplicateAttempt.success).toBe(false);
    expect(duplicateAttempt.error?.message).toContain('already exists');
  });

  it('toggles completion for today', async () => {
    const createResult = await service.createHabit({ title: 'Meditate' });
    const habitId = createResult.data!.id;

    // Toggle on
    const toggleOn = await service.toggleCompletion({ habitId });
    expect(toggleOn.success).toBe(true);
    expect(toggleOn.data).toBe(true);

    const isDone = await service.isHabitCompletedToday(habitId);
    expect(isDone).toBe(true);

    // Toggle off
    const toggleOff = await service.toggleCompletion({ habitId });
    expect(toggleOff.success).toBe(true);
    expect(toggleOff.data).toBe(false);

    const isDoneAfter = await service.isHabitCompletedToday(habitId);
    expect(isDoneAfter).toBe(false);
  });

  it('toggles and queries completion for any specified calendar date', async () => {
    const createResult = await service.createHabit({ title: 'Yoga' });
    const habitId = createResult.data!.id;
    const targetDate = '2026-11-10';

    // Verify initially not completed on targetDate
    expect(await service.isHabitCompleted(habitId, targetDate)).toBe(false);

    // Toggle on for targetDate
    const toggleOn = await service.toggleCompletion({ habitId, date: targetDate });
    expect(toggleOn.success).toBe(true);
    expect(toggleOn.data).toBe(true);
    expect(await service.isHabitCompleted(habitId, targetDate)).toBe(true);

    // Verify today is not affected
    expect(await service.isHabitCompletedToday(habitId)).toBe(false);

    // Toggle off for targetDate
    const toggleOff = await service.toggleCompletion({ habitId, date: targetDate });
    expect(toggleOff.success).toBe(true);
    expect(toggleOff.data).toBe(false);
    expect(await service.isHabitCompleted(habitId, targetDate)).toBe(false);
  });
});
