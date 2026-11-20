import { ChevronLeft, ChevronRight, Activity, Award, CheckCircle } from 'lucide-react';
import type { WeeklyAnalyticsAggregate } from '../domain/WeeklyAnalyticsAggregate';
import { WeeklyMetricCard } from './WeeklyMetricCard';
import { WeeklyDistributionChart } from './WeeklyDistributionChart';
import { AnalyticsEmptyState } from './AnalyticsEmptyState';
import { AnalyticsSkeleton } from './AnalyticsSkeleton';

export interface WeeklyAnalyticsViewProps {
  readonly analytics: WeeklyAnalyticsAggregate | null;
  readonly isLoading: boolean;
  readonly onPreviousWeek: () => void;
  readonly onNextWeek: () => void;
}

export function WeeklyAnalyticsView({
  analytics,
  isLoading,
  onPreviousWeek,
  onNextWeek,
}: WeeklyAnalyticsViewProps) {
  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (!analytics || !analytics.hasCompletions) {
    return (
      <div data-testid="analytics-view" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Weekly Analytics</h1>
            <p className="mt-1 text-sm text-text-muted">
              {analytics
                ? `${analytics.weekStartDate} to ${analytics.weekEndDate}`
                : 'Performance overview'}
            </p>
          </div>
          <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
            <button
              type="button"
              onClick={onPreviousWeek}
              aria-label="Previous week"
              className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNextWeek}
              aria-label="Next week"
              className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <AnalyticsEmptyState />
      </div>
    );
  }

  return (
    <div data-testid="analytics-view" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Weekly Analytics</h1>
          <p className="mt-1 text-sm text-text-muted">
            {analytics.weekStartDate} to {analytics.weekEndDate}
          </p>
        </div>

        <div className="flex items-center rounded-lg border border-border bg-surface p-0.5 shadow-sm">
          <button
            type="button"
            onClick={onPreviousWeek}
            aria-label="Previous week"
            className="rounded p-1.5 text-text-muted hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            aria-label="Next week"
            className="rounded p-1.5 text-text-muted hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <WeeklyMetricCard
          title="Completion Rate"
          value={`${analytics.completionRatePercentage}%`}
          subtitle={`${analytics.totalCompleted} of ${analytics.totalOpportunities} opportunities`}
          icon={<Activity className="h-4 w-4 text-primary" />}
          variant="default"
          testId="analytics-rate-card"
        />

        <WeeklyMetricCard
          title="Most Consistent Day"
          value={analytics.mostConsistentDay ?? 'None'}
          subtitle={
            analytics.mostConsistentDay
              ? `${analytics.dailyDistribution[analytics.mostConsistentDay]} completions`
              : 'Keep going to establish a top day'
          }
          icon={<Award className="h-4 w-4 text-streak-fire" />}
          variant="highlight"
          testId="analytics-best-day"
        />

        <WeeklyMetricCard
          title="Total Completed"
          value={analytics.totalCompleted}
          subtitle="Checkmarks logged this week"
          icon={<CheckCircle className="h-4 w-4 text-success" />}
          variant="success"
        />
      </div>

      <WeeklyDistributionChart
        distribution={analytics.dailyDistribution}
        mostConsistentDay={analytics.mostConsistentDay}
      />
    </div>
  );
}
