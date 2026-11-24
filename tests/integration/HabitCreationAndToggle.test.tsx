import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HabitList } from '../../src/features/habits/tracking/ui/HabitList';
import { HabitFormModal } from '../../src/features/habits/tracking/ui/HabitFormModal';
import { createHabit } from '../../src/features/habits/tracking/domain/Habit';
import type { StreakSummary } from '../../src/features/habits/streaks/domain/StreakSummary';

describe('Habit Creation & Daily Toggle Integration', () => {
  it('renders empty state when habit list is empty', () => {
    const onOpenModal = vi.fn();
    render(
      <HabitList
        habits={[]}
        streaks={new Map()}
        completionMap={new Map()}
        isLoading={false}
        onToggleHabit={vi.fn()}
        onDeleteHabit={vi.fn()}
        onOpenCreateModal={onOpenModal}
      />,
    );

    const emptyState = screen.getByTestId('empty-state-dashboard');
    expect(emptyState).toBeDefined();

    const createBtn = screen.getByTestId('habit-create-button');
    fireEvent.click(createBtn);
    expect(onOpenModal).toHaveBeenCalledTimes(1);
  });

  it('renders active habits and responds to completion toggle', () => {
    const habit = createHabit({ id: 'h-1', title: 'Drink 2L Water', category: 'health' });
    const onToggle = vi.fn();
    const streak: StreakSummary = {
      habitId: 'h-1',
      currentStreak: 2,
      bestStreak: 5,
      lastCompletedDate: '2026-11-17',
      status: 'PENDING_TODAY',
    };

    render(
      <HabitList
        habits={[habit]}
        streaks={new Map([['h-1', streak]])}
        completionMap={new Map([['h-1', false]])}
        isLoading={false}
        onToggleHabit={onToggle}
        onDeleteHabit={vi.fn()}
        onOpenCreateModal={vi.fn()}
      />,
    );

    const titleEl = screen.getByTestId('habit-title');
    expect(titleEl.textContent).toBe('Drink 2L Water');

    const toggleBtn = screen.getByTestId('habit-toggle-button');
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledWith('h-1');
  });

  it('validates whitespace and duplicate warnings in habit form modal', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const onClose = vi.fn();

    render(
      <HabitFormModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        existingTitles={['Read Book']}
      />,
    );

    const titleInput = screen.getByTestId('habit-input-title');
    const submitBtn = screen.getByTestId('habit-submit-button');

    // Attempt empty title
    fireEvent.change(titleInput, { target: { value: '   ' } });
    fireEvent.click(submitBtn);
    expect(onSubmit).not.toHaveBeenCalled();

    // Attempt duplicate title
    fireEvent.change(titleInput, { target: { value: 'read book' } });
    fireEvent.click(submitBtn);
    expect(onSubmit).not.toHaveBeenCalled();

    // Valid title
    fireEvent.change(titleInput, { target: { value: 'Walk 10k Steps' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Walk 10k Steps',
        description: undefined,
        category: 'other',
      });
    });
  });

  it('triggers visible energy celebration sparks on completion toggle', () => {
    const habit = createHabit({ id: 'h-1', title: 'Drink 2L Water', category: 'health' });
    render(
      <HabitList
        habits={[habit]}
        streaks={new Map()}
        completionMap={new Map([['h-1', false]])}
        isLoading={false}
        onToggleHabit={vi.fn()}
        onDeleteHabit={vi.fn()}
        onOpenCreateModal={vi.fn()}
      />,
    );

    const toggleBtn = screen.getByTestId('habit-toggle-button');
    fireEvent.click(toggleBtn);

    expect(screen.getByTestId('completion-sparks')).toBeDefined();
  });

  it('highlights newly created habit with animated arrival state and badge', () => {
    const habit = createHabit({ id: 'h-new', title: 'Morning Stretch', category: 'fitness' });
    render(
      <HabitList
        habits={[habit]}
        streaks={new Map()}
        completionMap={new Map()}
        isLoading={false}
        onToggleHabit={vi.fn()}
        onDeleteHabit={vi.fn()}
        onOpenCreateModal={vi.fn()}
        newlyCreatedHabitId="h-new"
      />,
    );

    const newBadge = screen.getByTestId('new-habit-badge');
    expect(newBadge).toBeDefined();
    expect(newBadge.textContent).toContain('NEW');
  });

  it('navigates dates and toggles completion for any selected date on dashboard', () => {
    const habit = createHabit({ id: 'h-1', title: 'Read Book', category: 'learning' });
    const onToggle = vi.fn();
    const onSelectDate = vi.fn();

    const { rerender } = render(
      <HabitList
        habits={[habit]}
        streaks={new Map()}
        completionMap={new Map([['h-1', false]])}
        isLoading={false}
        onToggleHabit={onToggle}
        onDeleteHabit={vi.fn()}
        onOpenCreateModal={vi.fn()}
        selectedDate="2026-11-15"
        onSelectDate={onSelectDate}
      />,
    );

    // Verify header reflects selected date
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('2026-11-15');

    // Previous day navigation
    const prevBtn = screen.getByTestId('prev-day-btn');
    fireEvent.click(prevBtn);
    expect(onSelectDate).toHaveBeenCalledWith('2026-11-14');

    // Next day navigation
    const nextBtn = screen.getByTestId('next-day-btn');
    fireEvent.click(nextBtn);
    expect(onSelectDate).toHaveBeenCalledWith('2026-11-16');

    // Toggle on selected date passes habitId and selectedDate
    const toggleBtn = screen.getByTestId('habit-toggle-button');
    fireEvent.click(toggleBtn);
    expect(onToggle).toHaveBeenCalledWith('h-1', '2026-11-15');

    // Today button jumps back to today
    const todayBtn = screen.getByTestId('dashboard-today-btn');
    fireEvent.click(todayBtn);
    expect(onSelectDate).toHaveBeenCalled();

    // Rerender with today
    rerender(
      <HabitList
        habits={[habit]}
        streaks={new Map()}
        completionMap={new Map([['h-1', false]])}
        isLoading={false}
        onToggleHabit={onToggle}
        onDeleteHabit={vi.fn()}
        onOpenCreateModal={vi.fn()}
      />,
    );
    const todayHeading = screen.getByRole('heading', { level: 1 });
    expect(todayHeading.textContent).toBe("Today's Habits");
  });
});
