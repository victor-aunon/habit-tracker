import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakBadge } from '../../../src/features/habits/streaks/ui/StreakBadge';

describe('StreakBadge Strength Progression', () => {
  it('renders daily streak for 1-6 days', () => {
    render(<StreakBadge currentStreak={3} bestStreak={5} status="ACTIVE" />);
    const badge = screen.getByTestId('streak-current-badge');
    expect(badge.textContent).toContain('3 days');
    expect(badge.textContent).not.toContain('strong');
    expect(badge.textContent).not.toContain('master');
  });

  it('renders weekly strength indicator for 7-29 days', () => {
    render(<StreakBadge currentStreak={14} bestStreak={14} status="ACTIVE" />);
    const badge = screen.getByTestId('streak-current-badge');
    expect(badge.textContent).toContain('14 days');
    expect(badge.textContent).toContain('2 wks strong');
  });

  it('renders monthly mastery indicator for 30+ days', () => {
    render(<StreakBadge currentStreak={30} bestStreak={30} status="ACTIVE" />);
    const badge = screen.getByTestId('streak-current-badge');
    expect(badge.textContent).toContain('30 days');
    expect(badge.textContent).toContain('1 mo master');
  });
});
