/**
 * Completion Record Domain Entity and Invariants
 *
 * Represents an individual historical instance of a completed habit on a calendar day.
 */

import { isFutureDate, localDateToday } from '../../../../core/domain/DateUtils';

export interface CompletionRecord {
  readonly id: string;
  readonly habitId: string;
  readonly date: string; // YYYY-MM-DD
  readonly completedAt: string; // ISO 8601 UTC
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateCompletionDate(dateStr: string, referenceDateStr?: string): string {
  if (!DATE_REGEX.test(dateStr)) {
    throw new Error(`Invalid completion date format: '${dateStr}'. Expected YYYY-MM-DD.`);
  }

  if (isFutureDate(dateStr, referenceDateStr)) {
    throw new Error(`Cannot log habit completion for future date: '${dateStr}'.`);
  }

  return dateStr;
}

export function createCompletionRecord(params: {
  id: string;
  habitId: string;
  date?: string;
  completedAt?: string;
  referenceDate?: string;
}): CompletionRecord {
  const targetDate = params.date ?? localDateToday();
  validateCompletionDate(targetDate, params.referenceDate);

  return {
    id: params.id,
    habitId: params.habitId,
    date: targetDate,
    completedAt: params.completedAt ?? new Date().toISOString(),
  };
}
