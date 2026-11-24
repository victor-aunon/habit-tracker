import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarGrid } from '../../src/features/habits/calendar-history/ui/CalendarGrid';
import type { DayCompletionStatus } from '../../src/features/habits/calendar-history/domain/DayCompletionStatus';

describe('Calendar Navigation & Day Inspection Integration', () => {
  const mockDays: DayCompletionStatus[] = [
    {
      date: '2026-11-17',
      status: 'ALL_COMPLETED',
      completedCount: 2,
      totalHabitsTracked: 2,
      habitBreakdown: [
        { habitId: 'h-1', title: 'Drink Water', isCompleted: true },
        { habitId: 'h-2', title: 'Exercise', isCompleted: true },
      ],
      isCurrentMonth: true,
      isFuture: false,
    },
    {
      date: '2026-11-18',
      status: 'PARTIALLY_COMPLETED',
      completedCount: 1,
      totalHabitsTracked: 2,
      habitBreakdown: [
        { habitId: 'h-1', title: 'Drink Water', isCompleted: true },
        { habitId: 'h-2', title: 'Exercise', isCompleted: false },
      ],
      isCurrentMonth: true,
      isFuture: false,
    },
    {
      date: '2026-11-19',
      status: 'NONE_COMPLETED',
      completedCount: 0,
      totalHabitsTracked: 2,
      habitBreakdown: [],
      isCurrentMonth: true,
      isFuture: true,
    },
  ];

  it('renders calendar grid and header controls', () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();

    render(
      <CalendarGrid
        year={2026}
        month={11}
        days={mockDays}
        selectedDate={null}
        onSelectDate={vi.fn()}
        onPreviousMonth={onPrev}
        onNextMonth={onNext}
        onToday={vi.fn()}
      />,
    );

    expect(screen.getByTestId('calendar-view')).toBeDefined();
    expect(screen.getByTestId('calendar-grid')).toBeDefined();

    const prevBtn = screen.getByTestId('calendar-prev-month');
    fireEvent.click(prevBtn);
    expect(onPrev).toHaveBeenCalledTimes(1);

    const nextBtn = screen.getByTestId('calendar-next-month');
    fireEvent.click(nextBtn);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('selects date cell and opens day detail inspection panel', () => {
    const onSelect = vi.fn();

    const { rerender } = render(
      <CalendarGrid
        year={2026}
        month={11}
        days={mockDays}
        selectedDate={null}
        onSelectDate={onSelect}
        onPreviousMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onToday={vi.fn()}
      />,
    );

    const dayCells = screen.getAllByTestId('calendar-day-cell');
    fireEvent.click(dayCells[0]);
    expect(onSelect).toHaveBeenCalledWith('2026-11-17');

    // Rerender with selected date
    rerender(
      <CalendarGrid
        year={2026}
        month={11}
        days={mockDays}
        selectedDate="2026-11-17"
        onSelectDate={onSelect}
        onPreviousMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onToday={vi.fn()}
      />,
    );

    expect(screen.getByTestId('day-detail-panel')).toBeDefined();
    expect(screen.getByText('Drink Water')).toBeDefined();
  });

  it('allows toggling habit completion status directly from day detail inspection panel', () => {
    const onToggleHabit = vi.fn();

    render(
      <CalendarGrid
        year={2026}
        month={11}
        days={mockDays}
        selectedDate="2026-11-18"
        onSelectDate={vi.fn()}
        onPreviousMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onToday={vi.fn()}
        onToggleHabit={onToggleHabit}
      />,
    );

    expect(screen.getByTestId('day-detail-panel')).toBeDefined();

    // Toggle missed habit (h-2) to complete it for 2026-11-18
    const toggleH2 = screen.getByTestId('toggle-day-habit-h-2');
    fireEvent.click(toggleH2);
    expect(onToggleHabit).toHaveBeenCalledWith('h-2', '2026-11-18');

    // Toggle completed habit (h-1) to uncomplete it for 2026-11-18
    const toggleH1 = screen.getByTestId('toggle-day-habit-h-1');
    fireEvent.click(toggleH1);
    expect(onToggleHabit).toHaveBeenCalledWith('h-1', '2026-11-18');
  });
});
