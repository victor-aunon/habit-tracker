import { lazy, Suspense } from 'react';
import { Layout } from './core/ui/Layout';
import { HabitList } from './features/habits/tracking/ui/HabitList';
import { CalendarSkeleton } from './features/habits/calendar-history/ui/CalendarSkeleton';
import { AnalyticsSkeleton } from './features/habits/weekly-analytics/ui/AnalyticsSkeleton';
import { addDays } from './core/domain/DateUtils';
import { useHabitAppState } from './core/ui/useHabitAppState';

const CalendarGrid = lazy(() =>
  import('./features/habits/calendar-history/ui/CalendarGrid').then((m) => ({
    default: m.CalendarGrid,
  })),
);

const WeeklyAnalyticsView = lazy(() =>
  import('./features/habits/weekly-analytics/ui/WeeklyAnalyticsView').then((m) => ({
    default: m.WeeklyAnalyticsView,
  })),
);

const HabitFormModal = lazy(() =>
  import('./features/habits/tracking/ui/HabitFormModal').then((m) => ({
    default: m.HabitFormModal,
  })),
);

const ExportImportModal = lazy(() =>
  import('./features/habits/backup/ui/ExportImportModal').then((m) => ({
    default: m.ExportImportModal,
  })),
);

export function App() {
  const state = useHabitAppState();

  return (
    <Layout
      currentRoute={state.route}
      onNavigate={state.navigate}
      toastMessage={state.toastMessage}
      onDismissToast={state.dismissToast}
      onOpenBackupModal={() => state.setIsBackupModalOpen(true)}
    >
      {state.route === '/calendar' ? (
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarGrid
            year={state.calYear}
            month={state.calMonth}
            days={state.calendarDays}
            selectedDate={state.selectedCalendarDate}
            onSelectDate={state.setSelectedCalendarDate}
            onPreviousMonth={state.handlePrevMonth}
            onNextMonth={state.handleNextMonth}
            onToday={state.handleCalToday}
            isLoading={state.isLoading}
          />
        </Suspense>
      ) : state.route === '/analytics' ? (
        <Suspense fallback={<AnalyticsSkeleton />}>
          <WeeklyAnalyticsView
            analytics={state.weeklyAnalytics}
            isLoading={state.isLoading}
            onPreviousWeek={() => state.setAnalyticsRefDate((d) => addDays(d, -7))}
            onNextWeek={() => state.setAnalyticsRefDate((d) => addDays(d, 7))}
          />
        </Suspense>
      ) : (
        <HabitList
          habits={state.habits}
          streaks={state.streaks}
          completionMap={state.completionMap}
          isLoading={state.isLoading}
          onToggleHabit={state.handleToggleHabit}
          onDeleteHabit={state.handleDeleteHabit}
          onOpenCreateModal={() => state.setIsCreateModalOpen(true)}
          newlyCreatedHabitId={state.newlyCreatedHabitId}
        />
      )}

      <Suspense fallback={null}>
        <HabitFormModal
          isOpen={state.isCreateModalOpen || state.route === '/habits/manage'}
          onClose={() => {
            state.setIsCreateModalOpen(false);
            if (state.route === '/habits/manage') state.navigate('/');
          }}
          onSubmit={state.handleCreateHabit}
          existingTitles={state.habits.map((h) => h.title)}
        />
        <ExportImportModal
          isOpen={state.isBackupModalOpen}
          onClose={() => state.setIsBackupModalOpen(false)}
          onExport={state.handleExportBackup}
          onImport={state.handleImportBackup}
        />
      </Suspense>
    </Layout>
  );
}
