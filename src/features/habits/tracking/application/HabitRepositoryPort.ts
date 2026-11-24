/**
 * Repository Port Contracts (Clean Architecture Application Boundary)
 *
 * Defines the contract for persistence adapters in src/features/habits/
 * Pure TypeScript interfaces - zero infrastructure implementation details.
 */

import type { Habit, HabitCategory } from '../domain/Habit';
import type { CompletionRecord } from '../domain/CompletionRecord';
import type { StorageOperationResult } from '../../../../core/domain/StorageOperationResult';

/**
 * Commands (Write Operations)
 */
export interface CreateHabitCommand {
  readonly title: string;
  readonly description?: string | null;
  readonly category?: HabitCategory;
}

export interface ToggleCompletionCommand {
  readonly habitId: string;
  readonly date?: string;
}

export interface DeleteHabitCommand {
  readonly habitId: string;
}

/**
 * Port for managing Habit Tracking Application Use Cases
 */
export interface IHabitTrackingService {
  getActiveHabits(): Promise<StorageOperationResult<Habit[]>>;
  createHabit(command: CreateHabitCommand): Promise<StorageOperationResult<Habit>>;
  toggleCompletion(command: ToggleCompletionCommand): Promise<StorageOperationResult<boolean>>;
  deleteHabit(command: DeleteHabitCommand): Promise<StorageOperationResult<boolean>>;
  isHabitCompletedToday(habitId: string): Promise<boolean>;
  isHabitCompleted(habitId: string, date: string): Promise<boolean>;
}

/**
 * Port for managing Habit entities in persistence
 */
export interface IHabitRepository {
  /**
   * Retrieves all active habits (isActive: true), sorted by creation date descending.
   */
  getAllActive(): Promise<StorageOperationResult<Habit[]>>;

  /**
   * Retrieves a specific habit by its unique identifier.
   */
  getById(id: string): Promise<StorageOperationResult<Habit | null>>;

  /**
   * Checks if an active habit with the given normalized title already exists.
   * Case-insensitive comparison.
   */
  existsByNormalizedTitle(normalizedTitle: string, excludeId?: string): Promise<boolean>;

  /**
   * Creates or updates a habit in persistence.
   */
  save(habit: Habit): Promise<StorageOperationResult<Habit>>;

  /**
   * Soft-deletes a habit by setting isActive = false and updating timestamp.
   */
  delete(id: string): Promise<StorageOperationResult<boolean>>;

  /**
   * Retrieves all habits in persistence (both active and inactive).
   */
  getAll(): Promise<StorageOperationResult<Habit[]>>;

  /**
   * Replaces all habits with the supplied collection (for backup restore).
   */
  restoreHabits(habits: Habit[]): Promise<StorageOperationResult<void>>;
}

/**
 * Port for managing historical Completion Records in persistence
 */
export interface ICompletionLogRepository {
  /**
   * Retrieves all completion records across all habits and dates.
   */
  getAll(): Promise<StorageOperationResult<CompletionRecord[]>>;

  /**
   * Replaces all completion records with the supplied collection (for backup restore).
   */
  restoreCompletions(records: CompletionRecord[]): Promise<StorageOperationResult<void>>;

  /**
   * Retrieves all completion records for a specific habit across all time.
   * Sorted in ascending or descending chronological order by date.
   */
  getByHabitId(habitId: string): Promise<StorageOperationResult<CompletionRecord[]>>;

  /**
   * Retrieves all completion records logged for a specific calendar date (YYYY-MM-DD).
   */
  getByDate(date: string): Promise<StorageOperationResult<CompletionRecord[]>>;

  /**
   * Retrieves all completion records falling between startDate and endDate (inclusive).
   * Dates in YYYY-MM-DD format.
   */
  getByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<StorageOperationResult<CompletionRecord[]>>;

  /**
   * Atomically toggles completion status for (habitId, date):
   * - If completed record exists, removes it.
   * - If no record exists, inserts new record with current timestamp.
   * Returns true if habit is now completed, false if now incomplete.
   */
  toggleCompletion(habitId: string, date: string): Promise<StorageOperationResult<boolean>>;

  /**
   * Verifies if a completion record exists for (habitId, date).
   */
  isCompleted(habitId: string, date: string): Promise<boolean>;
}
