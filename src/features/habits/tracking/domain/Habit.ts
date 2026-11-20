/**
 * Habit Domain Entity and Invariants
 *
 * Clean Architecture Domain Layer - Zero external dependencies.
 */

export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'productivity'
  | 'mindfulness'
  | 'learning'
  | 'other';

export const HABIT_CATEGORIES: readonly HabitCategory[] = [
  'health',
  'fitness',
  'productivity',
  'mindfulness',
  'learning',
  'other',
] as const;

export interface Habit {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly category: HabitCategory;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly isActive: boolean;
}

export function normalizeHabitTitle(title: string): string {
  return title.trim().toLowerCase();
}

export function validateHabitTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new Error('Habit title must be between 1 and 100 characters.');
  }
  if (trimmed.length > 100) {
    throw new Error('Habit title cannot exceed 100 characters.');
  }
  return trimmed;
}

export function validateHabitDescription(description?: string | null): string | null {
  if (!description) {
    return null;
  }
  const trimmed = description.trim();
  if (trimmed.length > 250) {
    throw new Error('Habit description cannot exceed 250 characters.');
  }
  return trimmed.length > 0 ? trimmed : null;
}

export function createHabit(params: {
  id: string;
  title: string;
  description?: string | null;
  category?: HabitCategory;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}): Habit {
  const validTitle = validateHabitTitle(params.title);
  const validDescription = validateHabitDescription(params.description);
  const now = new Date().toISOString();

  return {
    id: params.id,
    title: validTitle,
    description: validDescription,
    category: params.category ?? 'other',
    createdAt: params.createdAt ?? now,
    updatedAt: params.updatedAt ?? now,
    isActive: params.isActive ?? true,
  };
}
