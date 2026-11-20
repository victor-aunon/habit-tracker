import { describe, it, expect } from 'vitest';
import {
  createHabit,
  validateHabitTitle,
  validateHabitDescription,
  normalizeHabitTitle,
} from '../../../src/features/habits/tracking/domain/Habit';

describe('Habit Domain Entity & Invariants', () => {
  it('creates a habit with valid properties and defaults', () => {
    const habit = createHabit({
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Drink 2L Water',
      category: 'health',
    });

    expect(habit.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(habit.title).toBe('Drink 2L Water');
    expect(habit.category).toBe('health');
    expect(habit.isActive).toBe(true);
    expect(habit.description).toBeNull();
    expect(habit.createdAt).toBeDefined();
    expect(habit.updatedAt).toBeDefined();
  });

  it('normalizes title by trimming whitespace', () => {
    const title = validateHabitTitle('   Morning Meditation   ');
    expect(title).toBe('Morning Meditation');

    const normalized = normalizeHabitTitle('   Morning Meditation   ');
    expect(normalized).toBe('morning meditation');
  });

  it('rejects empty or whitespace-only titles (FR-019)', () => {
    expect(() => validateHabitTitle('')).toThrow(
      'Habit title must be between 1 and 100 characters.',
    );
    expect(() => validateHabitTitle('   ')).toThrow(
      'Habit title must be between 1 and 100 characters.',
    );
  });

  it('rejects titles longer than 100 characters (FR-019, US1-S5)', () => {
    const longTitle = 'a'.repeat(101);
    expect(() => validateHabitTitle(longTitle)).toThrow(
      'Habit title cannot exceed 100 characters.',
    );

    const exactly100 = 'a'.repeat(100);
    expect(validateHabitTitle(exactly100)).toBe(exactly100);
  });

  it('validates description and enforces max 250 characters', () => {
    expect(validateHabitDescription(null)).toBeNull();
    expect(validateHabitDescription('')).toBeNull();
    expect(validateHabitDescription('   ')).toBeNull();

    const validDesc = 'Read at least 10 pages before sleep';
    expect(validateHabitDescription(validDesc)).toBe(validDesc);

    const longDesc = 'd'.repeat(251);
    expect(() => validateHabitDescription(longDesc)).toThrow(
      'Habit description cannot exceed 250 characters.',
    );
  });
});
