/**
 * Habit Tracking Application Service
 *
 * Implements use cases for habit lifecycle, validation, and completion toggles.
 */

import type {
  IHabitTrackingService,
  CreateHabitCommand,
  ToggleCompletionCommand,
  DeleteHabitCommand,
} from './HabitRepositoryPort';
import type { IHabitRepository, ICompletionLogRepository } from './HabitRepositoryPort';
import { type Habit, createHabit, normalizeHabitTitle } from '../domain/Habit';
import { localDateToday } from '../../../../core/domain/DateUtils';
import {
  type StorageOperationResult,
  createStorageFailure,
} from '../../../../core/domain/StorageOperationResult';

export class HabitTrackingService implements IHabitTrackingService {
  public constructor(
    private readonly habitRepo: IHabitRepository,
    private readonly completionRepo: ICompletionLogRepository,
  ) {}

  public async getActiveHabits(): Promise<StorageOperationResult<Habit[]>> {
    return this.habitRepo.getAllActive();
  }

  public async createHabit(command: CreateHabitCommand): Promise<StorageOperationResult<Habit>> {
    const normalized = normalizeHabitTitle(command.title);
    const exists = await this.habitRepo.existsByNormalizedTitle(normalized);

    if (exists) {
      return createStorageFailure(
        'UNKNOWN',
        `A habit with title '${command.title.trim()}' already exists.`,
      );
    }

    try {
      const habit = createHabit({
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        title: command.title,
        description: command.description,
        category: command.category,
      });

      return await this.habitRepo.save(habit);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid habit attributes';
      return createStorageFailure('UNKNOWN', message, err);
    }
  }

  public async toggleCompletion(
    command: ToggleCompletionCommand,
  ): Promise<StorageOperationResult<boolean>> {
    const targetDate = command.date ?? localDateToday();
    return this.completionRepo.toggleCompletion(command.habitId, targetDate);
  }

  public async deleteHabit(command: DeleteHabitCommand): Promise<StorageOperationResult<boolean>> {
    return this.habitRepo.delete(command.habitId);
  }

  public async isHabitCompletedToday(habitId: string): Promise<boolean> {
    const today = localDateToday();
    return this.isHabitCompleted(habitId, today);
  }

  public async isHabitCompleted(habitId: string, date: string): Promise<boolean> {
    return this.completionRepo.isCompleted(habitId, date);
  }
}
