/**
 * LocalStorage Completion Log Repository Adapter
 *
 * Implements ICompletionLogRepository with atomic toggle and date range queries.
 */

import type { ICompletionLogRepository } from '../application/HabitRepositoryPort';
import type { CompletionRecord } from '../domain/CompletionRecord';
import {
  type StorageOperationResult,
  createStorageSuccess,
  createStorageFailure,
} from '../../../../core/domain/StorageOperationResult';

export const COMPLETIONS_STORAGE_KEY = 'workflow_test_completions_v1';

export class LocalStorageCompletionRepo implements ICompletionLogRepository {
  private inMemoryCache: Map<string, CompletionRecord> = new Map();
  private storageAvailable = true;

  public constructor() {
    this.hydrateFromStorage();
  }

  private compositeKey(habitId: string, date: string): string {
    return `${habitId}:${date}`;
  }

  private hydrateFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      this.storageAvailable = false;
      return;
    }
    try {
      const raw = localStorage.getItem(COMPLETIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CompletionRecord[];
        for (const item of parsed) {
          this.inMemoryCache.set(this.compositeKey(item.habitId, item.date), item);
        }
      }
    } catch (e) {
      console.warn('LocalStorageCompletionRepo: Failed to hydrate from storage:', e);
    }
  }

  private persistToStorage(): { success: boolean; isQuotaError: boolean; error?: unknown } {
    if (!this.storageAvailable || typeof localStorage === 'undefined') {
      return { success: false, isQuotaError: false };
    }
    try {
      const list = Array.from(this.inMemoryCache.values());
      localStorage.setItem(COMPLETIONS_STORAGE_KEY, JSON.stringify(list));
      return { success: true, isQuotaError: false };
    } catch (error) {
      const isQuota =
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014);
      return { success: false, isQuotaError: isQuota, error };
    }
  }

  public async getByHabitId(habitId: string): Promise<StorageOperationResult<CompletionRecord[]>> {
    const records = Array.from(this.inMemoryCache.values())
      .filter((r) => r.habitId === habitId)
      .sort((a, b) => a.date.localeCompare(b.date));

    return createStorageSuccess(records, false);
  }

  public async getByDate(date: string): Promise<StorageOperationResult<CompletionRecord[]>> {
    const records = Array.from(this.inMemoryCache.values()).filter((r) => r.date === date);
    return createStorageSuccess(records, false);
  }

  public async getByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<StorageOperationResult<CompletionRecord[]>> {
    const records = Array.from(this.inMemoryCache.values())
      .filter((r) => r.date >= startDate && r.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));

    return createStorageSuccess(records, false);
  }

  public async isCompleted(habitId: string, date: string): Promise<boolean> {
    return this.inMemoryCache.has(this.compositeKey(habitId, date));
  }

  public async toggleCompletion(
    habitId: string,
    date: string,
  ): Promise<StorageOperationResult<boolean>> {
    const key = this.compositeKey(habitId, date);
    const exists = this.inMemoryCache.has(key);
    let isNowCompleted = false;

    if (exists) {
      this.inMemoryCache.delete(key);
      isNowCompleted = false;
    } else {
      const newRecord: CompletionRecord = {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        habitId,
        date,
        completedAt: new Date().toISOString(),
      };
      this.inMemoryCache.set(key, newRecord);
      isNowCompleted = true;
    }

    const persistResult = this.persistToStorage();
    if (!persistResult.success) {
      return createStorageFailure(
        'QUOTA_EXCEEDED',
        'Storage limit reached. Toggle retained in memory.',
        persistResult.error,
        isNowCompleted,
      );
    }

    return createStorageSuccess(isNowCompleted, false);
  }

  public async getAll(): Promise<StorageOperationResult<CompletionRecord[]>> {
    const all = Array.from(this.inMemoryCache.values());
    return createStorageSuccess(all, false);
  }

  public async restoreCompletions(
    records: CompletionRecord[],
  ): Promise<StorageOperationResult<void>> {
    this.inMemoryCache.clear();
    for (const record of records) {
      this.inMemoryCache.set(this.compositeKey(record.habitId, record.date), record);
    }
    const persistResult = this.persistToStorage();
    if (!persistResult.success) {
      return createStorageFailure(
        'QUOTA_EXCEEDED',
        'Storage limit reached. Restored completions retained in memory.',
        persistResult.error,
      );
    }
    return createStorageSuccess(undefined, false);
  }
}
