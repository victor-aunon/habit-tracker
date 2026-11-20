import { useState } from 'react';
import type { DayCompletionStatus } from '../domain/DayCompletionStatus';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDayCell } from './CalendarDayCell';
import { DayDetailInspection } from './DayDetailInspection';
import { CalendarEmptyState } from './CalendarEmptyState';
import { CalendarSkeleton } from './CalendarSkeleton';
import { localDateToday } from '../../../../core/domain/DateUtils';

export interface CalendarGridProps {
  readonly year: number;
  readonly month: number;
  readonly days: DayCompletionStatus[];
  readonly selectedDate: string | null;
  readonly onSelectDate: (date: string) => void;
  readonly onPreviousMonth?: () => void;
  readonly onNextMonth?: () => void;
  readonly onToday?: () => void;
  readonly isLoading?: boolean;
}

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarGrid({
  year,
  month,
  days,
  selectedDate,
  onSelectDate,
  onPreviousMonth = () => {},
  onNextMonth = () => {},
  onToday = () => {},
  isLoading = false,
}: CalendarGridProps) {
  const [internalSelected, setInternalSelected] = useState<string | null>(selectedDate);

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  const today = localDateToday();
  const currentSelectedDate = selectedDate ?? internalSelected;
  const selectedDayStatus = days.find((d) => d.date === currentSelectedDate) ?? null;

  const handleCellClick = (date: string) => {
    setInternalSelected(date);
    onSelectDate(date);
  };

  const handleCloseDetail = () => {
    setInternalSelected(null);
  };

  return (
    <div data-testid="calendar-view" className="space-y-6">
      <CalendarHeader
        currentYear={year}
        currentMonth={month}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
        onToday={onToday}
      />

      {days.length === 0 ? (
        <CalendarEmptyState />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div
              data-testid="calendar-grid"
              className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
            >
              <div className="grid grid-cols-7 gap-1 text-center sm:gap-2">
                {WEEKDAY_HEADERS.map((day) => (
                  <div key={day} className="py-2 text-xs font-semibold text-text-muted">
                    {day}
                  </div>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-2">
                {days.map((day) => (
                  <CalendarDayCell
                    key={day.date}
                    dayStatus={day}
                    isSelected={day.date === currentSelectedDate}
                    isToday={day.date === today}
                    onSelect={handleCellClick}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {selectedDayStatus ? (
              <DayDetailInspection
                date={selectedDayStatus.date}
                dayStatus={selectedDayStatus}
                onClose={handleCloseDetail}
              />
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-border bg-surface-subtle p-6 text-center text-text-muted">
                <p className="text-sm">
                  Click any past or current calendar date to inspect completed and missed habits.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
