/**
 * Pure UTC-Anchored Date Arithmetic Utilities
 *
 * All operations operate on 'YYYY-MM-DD' calendar strings.
 * Internal calculations are anchored at UTC 12:00:00 to prevent DST/timezone rollover bugs.
 */

function padTwo(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = padTwo(date.getMonth() + 1);
  const day = padTwo(date.getDate());
  return `${year}-${month}-${day}`;
}

export function localDateToday(reference = new Date()): string {
  return formatDateISO(reference);
}

export function parseDateUTC(dateStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10) - 1;
  const day = Number.parseInt(dayStr, 10);
  return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
}

export function isFutureDate(dateStr: string, referenceDateStr?: string): boolean {
  const ref = referenceDateStr ?? localDateToday();
  return dateStr > ref;
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDateUTC(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = padTwo(d.getUTCMonth() + 1);
  const day = padTwo(d.getUTCDate());
  return `${y}-${m}-${day}`;
}

export function getDayOfWeekMonday(dateStr: string): number {
  const d = parseDateUTC(dateStr);
  const day = d.getUTCDay(); // 0 is Sunday, 1 is Monday
  return day === 0 ? 7 : day;
}

export function startOfWeekMonday(dateStr: string): string {
  const dayOfWeek = getDayOfWeekMonday(dateStr);
  const offset = dayOfWeek - 1;
  return addDays(dateStr, -offset);
}

export function daysInMonth(year: number, month: number): number {
  // month is 1-12. Date with day 0 of month + 1 gives the last day of month.
  return new Date(Date.UTC(year, month, 0, 12, 0, 0)).getUTCDate();
}

export function endOfWeekSunday(dateStr: string): string {
  const monday = startOfWeekMonday(dateStr);
  return addDays(monday, 6);
}

export function compareDates(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
