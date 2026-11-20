import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyAnalyticsView } from '../../src/features/habits/weekly-analytics/ui/WeeklyAnalyticsView';
import type { WeeklyAnalyticsAggregate } from '../../src/features/habits/weekly-analytics/domain/WeeklyAnalyticsAggregate';

describe('Weekly Analytics Integration', () => {
  const mockAggregate: WeeklyAnalyticsAggregate = {
    weekStartDate: '2026-11-16',
    weekEndDate: '2026-11-22',
    totalOpportunities: 21,
    totalCompleted: 14,
    completionRatePercentage: 67,
    dailyDistribution: {
      Monday: 2,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 2,
      Friday: 2,
      Saturday: 2,
      Sunday: 1,
    },
    mostConsistentDay: 'Wednesday',
    hasCompletions: true,
  };

  it('renders weekly performance metrics and 67% rate card', () => {
    render(
      <WeeklyAnalyticsView
        analytics={mockAggregate}
        isLoading={false}
        onPreviousWeek={vi.fn()}
        onNextWeek={vi.fn()}
      />,
    );

    expect(screen.getByTestId('analytics-view')).toBeDefined();

    const rateCard = screen.getByTestId('analytics-rate-card');
    expect(rateCard.textContent).toContain('67%');

    const bestDayCard = screen.getByTestId('analytics-best-day');
    expect(bestDayCard.textContent).toContain('Wednesday');

    const chart = screen.getByTestId('analytics-chart');
    expect(chart).toBeDefined();
  });

  it('handles empty analytics state when hasCompletions is false', () => {
    const emptyAggregate: WeeklyAnalyticsAggregate = {
      ...mockAggregate,
      totalCompleted: 0,
      completionRatePercentage: 0,
      hasCompletions: false,
      mostConsistentDay: null,
    };

    render(
      <WeeklyAnalyticsView
        analytics={emptyAggregate}
        isLoading={false}
        onPreviousWeek={vi.fn()}
        onNextWeek={vi.fn()}
      />,
    );

    const emptyState = screen.getByTestId('empty-state-analytics');
    expect(emptyState).toBeDefined();
  });
});
