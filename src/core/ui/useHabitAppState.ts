import { useState, useEffect, useCallback } from 'react';
import {
  habitService,
  streakService,
  calendarService,
  analyticsService,
  backupService,
} from '../services';
import type { Habit } from '../../features/habits/tracking/domain/Habit';
import type { StreakSummary } from '../../features/habits/streaks/domain/StreakSummary';
import type { DayCompletionStatus } from '../../features/habits/calendar-history/domain/DayCompletionStatus';
import type { WeeklyAnalyticsAggregate } from '../../features/habits/weekly-analytics/domain/WeeklyAnalyticsAggregate';
import { resolveStreakMilestone } from '../../features/habits/streaks/domain/StreakMilestones';
import { localDateToday } from '../domain/DateUtils';

export function useHabitAppState() {
  const [route, setRoute] = useState<string>(() => window.location.pathname || '/');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [newlyCreatedHabitId, setNewlyCreatedHabitId] = useState<string | null>(null);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [streaks, setStreaks] = useState<Map<string, StreakSummary>>(new Map());
  const [completionMap, setCompletionMap] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const today = localDateToday();
  const [selectedDashboardDate, setSelectedDashboardDate] = useState<string>(today);
  const [calYear, setCalYear] = useState(() => Number.parseInt(today.slice(0, 4), 10));
  const [calMonth, setCalMonth] = useState(() => Number.parseInt(today.slice(5, 7), 10));
  const [calendarDays, setCalendarDays] = useState<DayCompletionStatus[]>([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const [analyticsRefDate, setAnalyticsRefDate] = useState(today);
  const [weeklyAnalytics, setWeeklyAnalytics] = useState<WeeklyAnalyticsAggregate | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeRes = await habitService.getActiveHabits();
      const activeHabits = activeRes.data ?? [];
      setHabits(activeHabits);

      const streakMap = await streakService.calculateStreaksForAllActive();
      setStreaks(streakMap);

      const compMap = new Map<string, boolean>();
      for (const h of activeHabits) {
        const done = await habitService.isHabitCompleted(h.id, selectedDashboardDate);
        compMap.set(h.id, done);
      }
      setCompletionMap(compMap);

      const matrix = await calendarService.getMonthlyMatrix({ year: calYear, month: calMonth });
      setCalendarDays(matrix);

      const summary = await analyticsService.getWeeklySummary({ referenceDate: analyticsRefDate });
      setWeeklyAnalytics(summary);
    } catch (err) {
      console.error('Error refreshing state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [calYear, calMonth, analyticsRefDate, selectedDashboardDate]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleToggleHabit = async (habitId: string, targetDate?: string) => {
    const dateToToggle = targetDate ?? selectedDashboardDate;
    const isToday = dateToToggle === today;
    const wasCompleted = await habitService.isHabitCompleted(habitId, dateToToggle);
    const habit = habits.find((h) => h.id === habitId);
    const streak = streaks.get(habitId);

    const res = await habitService.toggleCompletion({ habitId, date: dateToToggle });
    if (!res.success && res.isRetainedInMemory) {
      setToastMessage(res.error?.message ?? 'Storage limit reached. Toggled in memory.');
    } else if (!wasCompleted && habit) {
      if (isToday) {
        const newStreak = (streak?.currentStreak ?? 0) + 1;
        const milestone = resolveStreakMilestone(newStreak, habit.title);

        if (milestone.celebrationMessage) {
          setToastMessage(milestone.celebrationMessage);
        } else {
          const allCompletedNow = habits.every((h) =>
            h.id === habitId ? true : completionMap.get(h.id) === true,
          );
          if (habits.length > 1 && allCompletedNow) {
            setToastMessage('🎉 Perfect Day! All habits completed today.');
          } else {
            setToastMessage(`✨ Habit completed! ${habit.title} added to your consistency.`);
          }
        }
      } else {
        setToastMessage(`✨ Habit ${habit.title} completed for ${dateToToggle}.`);
      }
    } else if (wasCompleted && habit) {
      if (!isToday) {
        setToastMessage(`Marked ${habit.title} as incomplete for ${dateToToggle}.`);
      }
    }
    await refreshData();
  };

  const handleCreateHabit = async (data: {
    title: string;
    description?: string;
    category: string;
  }) => {
    const res = await habitService.createHabit({
      title: data.title,
      description: data.description,
      category: data.category as Habit['category'],
    });

    if (!res.success) {
      setToastMessage(res.error?.message ?? 'Could not create habit.');
      return false;
    }

    if (res.isRetainedInMemory) {
      setToastMessage('Storage quota reached. Habit saved in session memory.');
    }

    if (res.data) {
      setNewlyCreatedHabitId(res.data.id);
      setTimeout(() => setNewlyCreatedHabitId(null), 4000);
    }

    await refreshData();
    return true;
  };

  const handleDeleteHabit = async (habitId: string) => {
    const res = await habitService.deleteHabit({ habitId });
    if (!res.success) {
      setToastMessage(res.error?.message ?? 'Could not delete habit.');
    }
    await refreshData();
  };

  const handlePrevMonth = () => {
    if (calMonth === 1) {
      setCalYear((y) => y - 1);
      setCalMonth(12);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 12) {
      setCalYear((y) => y + 1);
      setCalMonth(1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const handleCalToday = () => {
    setCalYear(Number.parseInt(today.slice(0, 4), 10));
    setCalMonth(Number.parseInt(today.slice(5, 7), 10));
  };

  const handleExportBackup = async () => {
    try {
      const jsonString = await backupService.exportBackupJsonString();
      const todayStr = localDateToday();
      const filename = `habits-backup-${todayStr}.json`;
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToastMessage('Backup downloaded successfully.');
    } catch {
      setToastMessage('Failed to export backup data.');
    }
  };

  const handleImportBackup = async (
    jsonContent: string,
  ): Promise<{ success: boolean; message: string }> => {
    const res = await backupService.importBackup(jsonContent);
    if (!res.success) {
      return {
        success: false,
        message: res.error?.message ?? 'Unknown error importing backup file.',
      };
    }

    const { habitsCount, completionsCount } = res.data ?? { habitsCount: 0, completionsCount: 0 };
    await refreshData();
    const msg = `Backup restored successfully: ${habitsCount} habits and ${completionsCount} logs restored.`;
    setToastMessage(msg);
    return {
      success: true,
      message: msg,
    };
  };

  return {
    route,
    navigate,
    toastMessage,
    dismissToast: () => setToastMessage(null),
    isCreateModalOpen,
    setIsCreateModalOpen,
    isBackupModalOpen,
    setIsBackupModalOpen,
    newlyCreatedHabitId,
    habits,
    streaks,
    completionMap,
    isLoading,
    selectedDashboardDate,
    setSelectedDashboardDate,
    calYear,
    calMonth,
    calendarDays,
    selectedCalendarDate,
    setSelectedCalendarDate,
    weeklyAnalytics,
    setAnalyticsRefDate,
    handleToggleHabit,
    handleCreateHabit,
    handleDeleteHabit,
    handlePrevMonth,
    handleNextMonth,
    handleCalToday,
    handleExportBackup,
    handleImportBackup,
  };
}
