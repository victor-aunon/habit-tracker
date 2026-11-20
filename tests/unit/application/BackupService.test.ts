import { describe, it, expect, beforeEach } from 'vitest';
import { BackupService } from '../../../src/features/habits/backup/application/BackupService';
import { LocalStorageHabitRepo } from '../../../src/features/habits/tracking/infrastructure/LocalStorageHabitRepo';
import { LocalStorageCompletionRepo } from '../../../src/features/habits/tracking/infrastructure/LocalStorageCompletionRepo';
import { createHabit } from '../../../src/features/habits/tracking/domain/Habit';

describe('BackupService', () => {
  let habitRepo: LocalStorageHabitRepo;
  let completionRepo: LocalStorageCompletionRepo;
  let service: BackupService;

  beforeEach(() => {
    localStorage.clear();
    habitRepo = new LocalStorageHabitRepo();
    completionRepo = new LocalStorageCompletionRepo();
    service = new BackupService(habitRepo, completionRepo);
  });

  it('exports empty database to valid JSON backup structure', async () => {
    const payload = await service.exportBackup();
    expect(payload.version).toBe(1);
    expect(payload.habits).toHaveLength(0);
    expect(payload.completions).toHaveLength(0);

    const json = await service.exportBackupJsonString();
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
  });

  it('exports populated habits and completions', async () => {
    const h1 = createHabit({ id: 'h-1', title: 'Meditate', createdAt: '2026-11-01T00:00:00Z' });
    await habitRepo.save(h1);
    await completionRepo.toggleCompletion('h-1', '2026-11-01');

    const payload = await service.exportBackup();
    expect(payload.habits).toHaveLength(1);
    expect(payload.habits[0].id).toBe('h-1');
    expect(payload.completions).toHaveLength(1);
    expect(payload.completions[0].habitId).toBe('h-1');
  });

  it('imports valid backup JSON string and replaces state in repositories', async () => {
    // Current state has one old habit
    await habitRepo.save(createHabit({ id: 'old-h', title: 'Old Habit' }));

    const backupJson = JSON.stringify({
      version: 1,
      exportedAt: '2026-11-19T12:00:00.000Z',
      habits: [
        {
          id: 'imported-1',
          title: 'Read Books',
          description: null,
          category: 'learning',
          createdAt: '2026-11-10T00:00:00.000Z',
          updatedAt: '2026-11-10T00:00:00.000Z',
          isActive: true,
        },
      ],
      completions: [
        {
          id: 'c-1',
          habitId: 'imported-1',
          date: '2026-11-10',
          completedAt: '2026-11-10T10:00:00.000Z',
        },
      ],
    });

    const result = await service.importBackup(backupJson);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ habitsCount: 1, completionsCount: 1 });

    // Repositories should reflect imported data
    const activeHabits = await habitRepo.getAllActive();
    expect(activeHabits.data).toHaveLength(1);
    expect(activeHabits.data?.[0].id).toBe('imported-1');

    const completions = await completionRepo.getAll();
    expect(completions.data).toHaveLength(1);
    expect(completions.data?.[0].habitId).toBe('imported-1');
  });

  it('rejects invalid JSON syntax without affecting current repository data', async () => {
    await habitRepo.save(createHabit({ id: 'keep-me', title: 'Keep Me' }));

    const result = await service.importBackup('{ not valid json');
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('JSON');

    // Data should remain intact
    const active = await habitRepo.getAllActive();
    expect(active.data).toHaveLength(1);
    expect(active.data?.[0].id).toBe('keep-me');
  });

  it('rejects schema-invalid backup payload without modifying repositories', async () => {
    await habitRepo.save(createHabit({ id: 'keep-me', title: 'Keep Me' }));

    const invalidSchema = JSON.stringify({
      version: 99,
      exportedAt: 'invalid',
      habits: 'not-array',
    });

    const result = await service.importBackup(invalidSchema);
    expect(result.success).toBe(false);

    const active = await habitRepo.getAllActive();
    expect(active.data).toHaveLength(1);
    expect(active.data?.[0].id).toBe('keep-me');
  });
});
