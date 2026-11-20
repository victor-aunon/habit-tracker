import type {
  IHabitRepository,
  ICompletionLogRepository,
} from '../../tracking/application/HabitRepositoryPort';
import {
  createBackupPayload,
  validateBackupPayload,
  type HabitBackupPayload,
} from '../domain/BackupData';
import {
  type StorageOperationResult,
  createStorageSuccess,
  createStorageFailure,
} from '../../../../core/domain/StorageOperationResult';

export interface ImportBackupResult {
  readonly habitsCount: number;
  readonly completionsCount: number;
}

export interface IBackupService {
  exportBackup(): Promise<HabitBackupPayload>;
  exportBackupJsonString(): Promise<string>;
  importBackup(
    rawJsonOrPayload: string | unknown,
  ): Promise<StorageOperationResult<ImportBackupResult>>;
}

export class BackupService implements IBackupService {
  public constructor(
    private readonly habitRepo: IHabitRepository,
    private readonly completionRepo: ICompletionLogRepository,
  ) {}

  public async exportBackup(): Promise<HabitBackupPayload> {
    const habitsRes = await this.habitRepo.getAll();
    const habits = habitsRes.data ?? [];

    const completionsRes = await this.completionRepo.getAll();
    const completions = completionsRes.data ?? [];

    return createBackupPayload(habits, completions);
  }

  public async exportBackupJsonString(): Promise<string> {
    const payload = await this.exportBackup();
    return JSON.stringify(payload, null, 2);
  }

  public async importBackup(
    rawJsonOrPayload: string | unknown,
  ): Promise<StorageOperationResult<ImportBackupResult>> {
    let rawObject: unknown;

    if (typeof rawJsonOrPayload === 'string') {
      try {
        rawObject = JSON.parse(rawJsonOrPayload);
      } catch (err) {
        return createStorageFailure('UNKNOWN', 'Invalid JSON file syntax.', err);
      }
    } else {
      rawObject = rawJsonOrPayload;
    }

    const validation = validateBackupPayload(rawObject);
    if (!validation.valid) {
      return createStorageFailure('UNKNOWN', `Invalid backup structure: ${validation.error}`);
    }

    const { habits, completions } = validation.data;

    const habitRestore = await this.habitRepo.restoreHabits(habits);
    if (!habitRestore.success) {
      return createStorageFailure(
        habitRestore.error?.code ?? 'UNKNOWN',
        habitRestore.error?.message ?? 'Failed to restore habits',
        habitRestore.error?.originalError,
      );
    }

    const completionRestore = await this.completionRepo.restoreCompletions(completions);
    if (!completionRestore.success) {
      return createStorageFailure(
        completionRestore.error?.code ?? 'UNKNOWN',
        completionRestore.error?.message ?? 'Failed to restore completion records',
        completionRestore.error?.originalError,
      );
    }

    return createStorageSuccess({
      habitsCount: habits.length,
      completionsCount: completions.length,
    });
  }
}
