/**
 * Streak Milestones & Strength Tiers Value Object
 *
 * Models the progression from daily consistency to weekly momentum and monthly mastery.
 */

export type StreakStrengthTier = 'UNSTARTED' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface StreakMilestoneInfo {
  readonly tier: StreakStrengthTier;
  readonly label: string;
  readonly weeks: number;
  readonly months: number;
  readonly isWeeklyMilestone: boolean;
  readonly isMonthlyMilestone: boolean;
  readonly celebrationMessage: string | null;
}

export function resolveStreakMilestone(
  currentStreak: number,
  habitTitle = 'Habit',
): StreakMilestoneInfo {
  if (currentStreak <= 0) {
    return {
      tier: 'UNSTARTED',
      label: '',
      weeks: 0,
      months: 0,
      isWeeklyMilestone: false,
      isMonthlyMilestone: false,
      celebrationMessage: null,
    };
  }

  const weeks = Math.floor(currentStreak / 7);
  const months = Math.floor(currentStreak / 30);

  if (currentStreak >= 30) {
    const isMonthlyMilestone = currentStreak % 30 === 0;
    const monthLabel = months === 1 ? '1 mo master' : `${months} mos master`;
    const celebrationMessage = isMonthlyMilestone
      ? `👑 ${months === 1 ? '1-Month Master' : `${months}-Month Master`}! You completed ${currentStreak} days in a row of "${habitTitle}". Legendary consistency!`
      : null;

    return {
      tier: 'MONTHLY',
      label: monthLabel,
      weeks,
      months,
      isWeeklyMilestone: false,
      isMonthlyMilestone,
      celebrationMessage,
    };
  }

  if (currentStreak >= 7) {
    const isWeeklyMilestone = currentStreak % 7 === 0;
    const weekLabel = weeks === 1 ? '1 wk strong' : `${weeks} wks strong`;
    const celebrationMessage = isWeeklyMilestone
      ? `🔥 ${weeks === 1 ? '1-Week Streak' : `${weeks}-Week Streak`}! ${currentStreak} days in a row of "${habitTitle}". Getting stronger every day!`
      : null;

    return {
      tier: 'WEEKLY',
      label: weekLabel,
      weeks,
      months: 0,
      isWeeklyMilestone,
      isMonthlyMilestone: false,
      celebrationMessage,
    };
  }

  return {
    tier: 'DAILY',
    label: currentStreak === 1 ? '1 day' : `${currentStreak} days`,
    weeks: 0,
    months: 0,
    isWeeklyMilestone: false,
    isMonthlyMilestone: false,
    celebrationMessage: null,
  };
}
