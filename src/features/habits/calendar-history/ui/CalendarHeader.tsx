import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export interface CalendarHeaderProps {
  readonly currentYear: number;
  readonly currentMonth: number;
  readonly onPreviousMonth: () => void;
  readonly onNextMonth: () => void;
  readonly onToday: () => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function CalendarHeader({
  currentYear,
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  const monthName = MONTH_NAMES[currentMonth - 1] ?? 'Month';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text">
          {monthName} {currentYear}
        </h2>
        <p className="text-xs text-text-muted">Track monthly routine consistency</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToday}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Today
        </button>

        <div className="flex items-center rounded-lg border border-border bg-surface p-0.5 shadow-sm">
          <button
            type="button"
            onClick={onPreviousMonth}
            data-testid="calendar-prev-month"
            aria-label="Previous month"
            className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            data-testid="calendar-next-month"
            aria-label="Next month"
            className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
