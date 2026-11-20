import { Check, Circle, Minus, CircleDot } from 'lucide-react';
import type { DayCompletionStatus } from '../domain/DayCompletionStatus';

export interface CalendarDayCellProps {
  readonly dayStatus: DayCompletionStatus;
  readonly isSelected: boolean;
  readonly isToday: boolean;
  readonly onSelect: (date: string) => void;
}

export function CalendarDayCell({
  dayStatus,
  isSelected,
  isToday,
  onSelect,
}: CalendarDayCellProps) {
  const dayNumber = Number.parseInt(dayStatus.date.slice(8, 10), 10);
  const { isCurrentMonth, isFuture, status } = dayStatus;

  const renderStatusGlyph = () => {
    if (isFuture) {
      return <Minus className="h-3.5 w-3.5 text-text-muted/40" aria-label="Upcoming date" />;
    }
    switch (status) {
      case 'ALL_COMPLETED':
        return (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground"
            title="All habits completed"
          >
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
          </span>
        );
      case 'PARTIALLY_COMPLETED':
        return (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full bg-warning/20 text-warning"
            title="Partially completed"
          >
            <CircleDot className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        );
      case 'NONE_COMPLETED':
        return (
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full border border-danger text-danger"
            title="None completed"
          >
            <Circle className="h-3 w-3" aria-hidden="true" />
          </span>
        );
      case 'NO_HABITS':
      default:
        return (
          <span title="No habits tracked">
            <Minus className="h-3 w-3 text-text-muted/40" />
          </span>
        );
    }
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(dayStatus.date)}
      disabled={isFuture}
      data-testid="calendar-day-cell"
      aria-label={`${dayStatus.date}, ${status}`}
      className={`relative flex min-h-18 flex-col items-center justify-between rounded-xl border p-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isCurrentMonth ? 'bg-surface text-text' : 'bg-surface-subtle text-text-muted/60 opacity-60'
      } ${
        isSelected
          ? 'border-primary ring-2 ring-primary/30 shadow-md'
          : isToday
            ? 'border-primary/60'
            : 'border-border hover:border-text-secondary/40 hover:bg-surface-hover'
      } ${isFuture ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      <div className="flex w-full items-center justify-between text-xs">
        <span
          className={`font-mono font-semibold ${
            isToday ? 'rounded-full bg-primary px-1.5 py-0.5 text-primary-foreground' : ''
          }`}
        >
          {dayNumber}
        </span>
        {dayStatus.totalHabitsTracked > 0 && !isFuture && (
          <span className="text-xs text-text-muted">
            {dayStatus.completedCount}/{dayStatus.totalHabitsTracked}
          </span>
        )}
      </div>

      <div className="mt-1 flex items-center justify-center">{renderStatusGlyph()}</div>
    </button>
  );
}
