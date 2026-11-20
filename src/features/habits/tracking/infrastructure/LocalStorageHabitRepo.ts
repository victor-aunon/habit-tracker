/**
 * LocalStorage Habit Repository Adapter
 *
 * Implements IHabitRepository with in-memory fallback on quota exhaustion.
 */

import type { IHabitRepository } from '../application/HabitRepositoryPort';
import type { Habit } from '../domain/Habit';
import { normalizeHabitTitle } from '../domain/Habit';
import {
  type StorageOperationResult,
  createStorageSuccess,
  createStorageFailure,
} from '../../../../core/domain/StorageOperationResult';

export const HABIT_STORAGE_KEY = 'workflow_test_habits_v1';

export class LocalStorageHabitRepo implements IHabitRepository {
  private inMemoryCache: Map<string, Habit> = new Map();
  private storageAvailable = true;

  public constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      this.storageAvailable = false;
      return;
    }
    try {
      const raw = localStorage.getItem(HABIT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Habit[];
        for (const item of parsed) {
          this.inMemoryCache.set(item.id, item);
        }
      }
    } catch (e) {
      console.warn('LocalStorageHabitRepo: Failed to hydrate from storage:', e);
    }
  }

  private persistToStorage(): { success: boolean; isQuotaError: boolean; error?: unknown } {
    if (!this.storageAvailable || typeof localStorage === 'undefined') {
      return { success: false, isQuotaError: false };
    }
    try {
      const list = Array.from(this.inMemoryCache.values());
      localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(list));
      return { success: true, isQuotaError: false };
    } catch (error) {
      const isQuota =
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014);
      return { success: false, isQuotaError: isQuota, error };
    }
  }

  public async getAllActive(): Promise<StorageOperationResult<Habit[]>> {
    const active = Array.from(this.inMemoryCache.values())
      .filter((h) => h.isActive)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return createStorageSuccess(active, false);
  }

  public async getById(id: string): Promise<StorageOperationResult<Habit | null>> {
    const habit = this.inMemoryCache.get(id) ?? null;
    return createStorageSuccess(habit, false);
  }

  public async existsByNormalizedTitle(
    normalizedTitle: string,
    excludeId?: string,
  ): Promise<boolean> {
    const target = normalizeHabitTitle(normalizedTitle);
    for (const habit of this.inMemoryCache.values()) {
      if (!habit.isActive) continue;
      if (excludeId && habit.id === excludeId) continue;
      if (normalizeHabitTitle(habit.title) === target) {
        return true;
      }
    }
    return false;
  }

  public async save(habit: Habit): Promise<StorageOperationResult<Habit>> {
    this.inMemoryCache.set(habit.id, habit);
    const result = this.persistToStorage();

    if (!result.success) {
      const code = result.isQuotaError ? 'QUOTA_EXCEEDED' : 'UNKNOWN';
      const msg = result.isQuotaError
        ? 'Storage quota exceeded. Changes retained in memory for this session.'
        : 'Failed to write to local storage. Changes retained in memory.';
      return createStorageFailure(code, msg, result.error, habit);
    }

    return createStorageSuccess(habit, false);
  }

  public async delete(id: string): Promise<StorageOperationResult<boolean>> {
    const habit = this.inMemoryCache.get(id);
    if (!habit) {
      return createStorageSuccess(false, false);
    }

    const updated: Habit = {
      ...habit,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };
    this.inMemoryCache.set(id, updated);
    const result = this.persistToStorage();

    if (!result.success) {
      return createStorageFailure('QUOTA_EXCEEDED', 'Storage full', result.error, true);
    }

    return createStorageSuccess(true, false);
  }

  public async getAll(): Promise<StorageOperationResult<Habit[]>> {
    const all = Array.from(this.inMemoryCache.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return createStorageSuccess(all, false);
  }

  public async restoreHabits(habits: Habit[]): Promise<StorageOperationResult<void>> {
    this.inMemoryCache.clear();
    for (const habit of habits) {
      this.inMemoryCache.set(habit.id, habit);
    }
    const result = this.persistToStorage();
    if (!result.success) {
      return createStorageFailure(
        'QUOTA_EXCEEDED',
        'Failed to persist restored habits to storage',
        result.error,
      );
    }
    return createStorageSuccess(undefined, false);
  }
}
