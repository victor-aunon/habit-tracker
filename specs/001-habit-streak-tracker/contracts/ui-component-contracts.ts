/**
 * UI Component Contracts & Accessibility Architecture
 *
 * Defines React component prop interfaces, test selectors, ARIA roles,
 * and Atomic Design boundaries. Strictly enforces one component per file.
 */

import type { ReactNode } from 'react';
import type { Habit } from '@/features/habits/tracking/domain/Habit';
import type { StreakSummary } from '@/features/habits/streaks/domain/StreakSummary';
import type { DayCompletionStatus } from '@/features/habits/calendar-history/domain/DayCompletionStatus';
import type { WeeklyAnalyticsAggregate } from '@/features/habits/weekly-analytics/domain/WeeklyAnalyticsAggregate';

// ----------------------------------------------------------------------------
// Atoms
// ----------------------------------------------------------------------------

export interface StreakBadgeProps {
  readonly currentStreak: number;
  readonly bestStreak: number;
  readonly status: 'ACTIVE' | 'PENDING_TODAY' | 'BROKEN' | 'UNSTARTED';
  readonly className?: string;
}

export interface CompletionToggleProps {
  readonly isCompleted: boolean;
  readonly onToggle: () => void;
  readonly disabled?: boolean;
  readonly habitTitle: string;
  readonly 'data-testid'?: string;
}

export interface CalendarDayCellProps {
  readonly dayStatus: DayCompletionStatus;
  readonly isSelected: boolean;
  readonly isToday: boolean;
  readonly isCurrentMonth: boolean;
  readonly onSelect: (date: string) => void;
}

// ----------------------------------------------------------------------------
// Molecules
// ----------------------------------------------------------------------------

export interface HabitCardProps {
  readonly habit: Habit;
  readonly streak: StreakSummary;
  readonly isCompletedToday: boolean;
  readonly onToggle: (habitId: string) => void;
  readonly onRequestDelete: (habitId: string) => void;
}

export interface CalendarHeaderProps {
  readonly currentYear: number;
  readonly currentMonth: number;
  readonly onPreviousMonth: () => void;
  readonly onNextMonth: () => void;
  readonly onToday: () => void;
}

export interface DayDetailInspectionProps {
  readonly date: string;
  readonly dayStatus: DayCompletionStatus | null;
  readonly onClose: () => void;
}

export interface WeeklyMetricCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly subtitle?: string;
  readonly icon?: ReactNode;
  readonly variant?: 'default' | 'success' | 'highlight';
}

// ----------------------------------------------------------------------------
// Organisms
// ----------------------------------------------------------------------------

export interface HabitListProps {
  readonly habits: Habit[];
  readonly streaks: Map<string, StreakSummary>;
  readonly completionMap: Map<string, boolean>;
  readonly isLoading: boolean;
  readonly onToggleHabit: (habitId: string) => void;
  readonly onDeleteHabit: (habitId: string) => void;
  readonly onOpenCreateModal: () => void;
}

export interface CalendarGridProps {
  readonly year: number;
  readonly month: number;
  readonly days: DayCompletionStatus[];
  readonly selectedDate: string | null;
  readonly onSelectDate: (date: string) => void;
}

export interface WeeklyAnalyticsViewProps {
  readonly analytics: WeeklyAnalyticsAggregate | null;
  readonly isLoading: boolean;
  readonly onPreviousWeek: () => void;
  readonly onNextWeek: () => void;
}

export interface HabitFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: {
    title: string;
    description?: string;
    category: string;
  }) => Promise<boolean>;
  readonly existingTitles: string[];
}

export interface DeleteConfirmationDialogProps {
  readonly isOpen: boolean;
  readonly habitTitle: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

// ----------------------------------------------------------------------------
// Deterministic Test Selectors & Contract Manifest
// ----------------------------------------------------------------------------

export const TEST_SELECTORS = {
  HABIT_CARD: 'habit-card',
  HABIT_TITLE: 'habit-title',
  HABIT_TOGGLE_BUTTON: 'habit-toggle-button',
  HABIT_DELETE_BUTTON: 'habit-delete-button',
  HABIT_CREATE_BUTTON: 'habit-create-button',
  HABIT_INPUT_TITLE: 'habit-input-title',
  HABIT_SUBMIT_BUTTON: 'habit-submit-button',
  STREAK_CURRENT_BADGE: 'streak-current-badge',
  STREAK_BEST_BADGE: 'streak-best-badge',
  CALENDAR_GRID: 'calendar-grid',
  CALENDAR_DAY_CELL: 'calendar-day-cell',
  CALENDAR_PREV_MONTH: 'calendar-prev-month',
  CALENDAR_NEXT_MONTH: 'calendar-next-month',
  DAY_DETAIL_PANEL: 'day-detail-panel',
  ANALYTICS_RATE_CARD: 'analytics-rate-card',
  ANALYTICS_BEST_DAY: 'analytics-best-day',
  ANALYTICS_CHART: 'analytics-chart',
  DELETE_CONFIRM_BUTTON: 'delete-confirm-button',
  DELETE_CANCEL_BUTTON: 'delete-cancel-button',
  EMPTY_STATE_DASHBOARD: 'empty-state-dashboard',
  EMPTY_STATE_CALENDAR: 'empty-state-calendar',
  EMPTY_STATE_ANALYTICS: 'empty-state-analytics',
  STORAGE_ERROR_ALERT: 'storage-error-alert',
} as const;
