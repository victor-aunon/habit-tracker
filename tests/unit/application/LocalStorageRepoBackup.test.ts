import { describe, it, expect, beforeEach } from 'vitest';
import {
  LocalStorageHabitRepo,
  HABIT_STORAGE_KEY,
} from '../../../src/features/habits/tracking/infrastructure/LocalStorageHabitRepo';
import {
  LocalStorageCompletionRepo,
  COMPLETIONS_STORAGE_KEY,
} from '../../../src/features/habits/tracking/infrastructure/LocalStorageCompletionRepo';
import { createHabit } from '../../../src/features/habits/tracking/domain/Habit';
import type { CompletionRecord } from '../../../src/features/habits/tracking/domain/CompletionRecord';

describe('LocalStorage Repositories - Backup Support (getAll & restore)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('LocalStorageHabitRepo', () => {
    it('getAll returns both active and inactive habits', async () => {
      const repo = new LocalStorageHabitRepo();
      const h1 = createHabit({ id: 'h-1', title: 'Habit 1', isActive: true });
      const h2 = createHabit({ id: 'h-2', title: 'Habit 2', isActive: false });

      await repo.save(h1);
      await repo.save(h2);

      const allResult = await repo.getAll();
      expect(allResult.success).toBe(true);
      expect(allResult.data).toHaveLength(2);
    });

    it('restoreHabits completely replaces existing habits in memory and localStorage', async () => {
      const repo = new LocalStorageHabitRepo();
      await repo.save(createHabit({ id: 'old-1', title: 'Old Habit' }));

      const newHabits = [
        createHabit({ id: 'restored-1', title: 'Restored 1' }),
        createHabit({ id: 'restored-2', title: 'Restored 2' }),
      ];

      const res = await repo.restoreHabits(newHabits);
      expect(res.success).toBe(true);

      const all = await repo.getAll();
      expect(all.data).toHaveLength(2);
      expect(all.data?.map((h) => h.id)).toEqual(
        expect.arrayContaining(['restored-1', 'restored-2']),
      );

      const raw = localStorage.getItem(HABIT_STORAGE_KEY);
      expect(raw).toBeDefined();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(2);
    });
  });

  describe('LocalStorageCompletionRepo', () => {
    it('getAll returns all stored completion records', async () => {
      const repo = new LocalStorageCompletionRepo();
      await repo.toggleCompletion('h-1', '2026-11-01');
      await repo.toggleCompletion('h-1', '2026-11-02');

      const allResult = await repo.getAll();
      expect(allResult.success).toBe(true);
      expect(allResult.data).toHaveLength(2);
    });

    it('restoreCompletions completely replaces existing records in memory and localStorage', async () => {
      const repo = new LocalStorageCompletionRepo();
      await repo.toggleCompletion('old-h', '2026-10-01');

      const newRecords: CompletionRecord[] = [
        { id: 'c-1', habitId: 'h-1', date: '2026-11-10', completedAt: '2026-11-10T10:00:00Z' },
        { id: 'c-2', habitId: 'h-2', date: '2026-11-11', completedAt: '2026-11-11T10:00:00Z' },
      ];

      const res = await repo.restoreCompletions(newRecords);
      expect(res.success).toBe(true);

      const all = await repo.getAll();
      expect(all.data).toHaveLength(2);

      const raw = localStorage.getItem(COMPLETIONS_STORAGE_KEY);
      expect(raw).toBeDefined();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(2);
    });
  });
});
