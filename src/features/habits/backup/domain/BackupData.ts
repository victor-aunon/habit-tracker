import type { Habit } from '../../tracking/domain/Habit';
import type { CompletionRecord } from '../../tracking/domain/CompletionRecord';

export interface HabitBackupPayload {
  readonly version: 1;
  readonly exportedAt: string;
  readonly habits: Habit[];
  readonly completions: CompletionRecord[];
}

export type ValidationResult =
  | { readonly valid: true; readonly data: HabitBackupPayload }
  | { readonly valid: false; readonly error: string };

export function createBackupPayload(
  habits: Habit[],
  completions: CompletionRecord[],
  referenceDate = new Date(),
): HabitBackupPayload {
  return {
    version: 1,
    exportedAt: referenceDate.toISOString(),
    habits,
    completions,
  };
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateBackupPayload(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, error: 'Backup payload must be a non-null object.' };
  }

  const obj = raw as Record<string, unknown>;

  if (obj.version !== 1) {
    return { valid: false, error: 'Unsupported or missing backup version. Expected version 1.' };
  }

  if (typeof obj.exportedAt !== 'string') {
    return { valid: false, error: 'Missing or invalid exportedAt timestamp.' };
  }

  if (!Array.isArray(obj.habits)) {
    return { valid: false, error: 'Backup habits must be an array.' };
  }

  if (!Array.isArray(obj.completions)) {
    return { valid: false, error: 'Backup completions must be an array.' };
  }

  for (let i = 0; i < obj.habits.length; i++) {
    const h = obj.habits[i];
    if (!h || typeof h !== 'object') {
      return { valid: false, error: `Invalid habit object at index ${i}.` };
    }
    const habit = h as Record<string, unknown>;
    if (typeof habit.id !== 'string' || habit.id.trim() === '') {
      return { valid: false, error: `Habit at index ${i} has an invalid or missing id.` };
    }
    if (typeof habit.title !== 'string' || habit.title.trim() === '') {
      return { valid: false, error: `Habit at index ${i} has an invalid or empty title.` };
    }
    if (typeof habit.createdAt !== 'string' || habit.createdAt.trim() === '') {
      return { valid: false, error: `Habit at index ${i} has an invalid createdAt timestamp.` };
    }
  }

  for (let i = 0; i < obj.completions.length; i++) {
    const c = obj.completions[i];
    if (!c || typeof c !== 'object') {
      return { valid: false, error: `Invalid completion object at index ${i}.` };
    }
    const comp = c as Record<string, unknown>;
    if (typeof comp.id !== 'string' || comp.id.trim() === '') {
      return { valid: false, error: `Completion record at index ${i} has an invalid id.` };
    }
    if (typeof comp.habitId !== 'string' || comp.habitId.trim() === '') {
      return { valid: false, error: `Completion record at index ${i} has an invalid habitId.` };
    }
    if (typeof comp.date !== 'string' || !DATE_REGEX.test(comp.date)) {
      return {
        valid: false,
        error: `Completion record at index ${i} has an invalid date format (must be YYYY-MM-DD).`,
      };
    }
  }

  return {
    valid: true,
    data: raw as HabitBackupPayload,
  };
}
