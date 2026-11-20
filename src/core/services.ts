/**
 * Application Composition Root
 *
 * Instantiates infrastructure persistence adapters and wires them
 * into application use-case services.
 */

import { LocalStorageHabitRepo } from '../features/habits/tracking/infrastructure/LocalStorageHabitRepo';
import { LocalStorageCompletionRepo } from '../features/habits/tracking/infrastructure/LocalStorageCompletionRepo';
import { HabitTrackingService } from '../features/habits/tracking/application/HabitTrackingService';
import { StreakService } from '../features/habits/streaks/application/StreakService';
import { CalendarHistoryService } from '../features/habits/calendar-history/application/CalendarHistoryService';
import { WeeklyAnalyticsService } from '../features/habits/weekly-analytics/application/WeeklyAnalyticsService';
import { BackupService } from '../features/habits/backup/application/BackupService';

const habitRepo = new LocalStorageHabitRepo();
const completionRepo = new LocalStorageCompletionRepo();

export const habitService = new HabitTrackingService(habitRepo, completionRepo);
export const streakService = new StreakService(habitRepo, completionRepo);
export const calendarService = new CalendarHistoryService(habitRepo, completionRepo);
export const analyticsService = new WeeklyAnalyticsService(habitRepo, completionRepo);
export const backupService = new BackupService(habitRepo, completionRepo);
