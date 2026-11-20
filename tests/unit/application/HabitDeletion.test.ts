import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HabitTrackingService } from '../../../src/features/habits/tracking/application/HabitTrackingService';
import { LocalStorageHabitRepo } from '../../../src/features/habits/tracking/infrastructure/LocalStorageHabitRepo';
import { LocalStorageCompletionRepo } from '../../../src/features/habits/tracking/infrastructure/LocalStorageCompletionRepo';

describe('Habit Deletion Safeguards', () => {
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

  it('soft-deletes habit and removes it from active list', async () => {
    const created = await service.createHabit({ title: 'Old Routine' });
    const habitId = created.data!.id;

    const deleteResult = await service.deleteHabit({ habitId });
    expect(deleteResult.success).toBe(true);

    const activeList = await service.getActiveHabits();
    expect(activeList.data).toHaveLength(0);

    const raw = await habitRepo.getById(habitId);
    expect(raw.data?.isActive).toBe(false);
  });

  it('allows creating a new habit with the same title after previous is deleted (FR-020)', async () => {
    const habit1 = await service.createHabit({ title: 'Yoga' });
    await service.deleteHabit({ habitId: habit1.data!.id });

    // Title 'Yoga' is now inactive, so creation should succeed
    const habit2 = await service.createHabit({ title: 'Yoga' });
    expect(habit2.success).toBe(true);
    expect(habit2.data?.id).not.toBe(habit1.data!.id);

    const activeList = await service.getActiveHabits();
    expect(activeList.data).toHaveLength(1);
    expect(activeList.data?.[0].id).toBe(habit2.data?.id);
  });

  it('preserves historical completion records after habit soft-deletion', async () => {
    const created = await service.createHabit({ title: 'Reading' });
    const habitId = created.data!.id;

    await service.toggleCompletion({ habitId, date: '2026-11-17' });
    await service.toggleCompletion({ habitId, date: '2026-11-18' });

    await service.deleteHabit({ habitId });

    // Historical records remain intact
    const logs = await completionRepo.getByHabitId(habitId);
    expect(logs.data).toHaveLength(2);
  });
});
