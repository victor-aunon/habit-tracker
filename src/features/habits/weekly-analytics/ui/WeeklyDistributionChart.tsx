import type { DayOfWeek } from '../domain/WeeklyAnalyticsAggregate';
import { DAYS_OF_WEEK } from '../domain/WeeklyAnalyticsAggregate';

export interface WeeklyDistributionChartProps {
  readonly distribution: Record<DayOfWeek, number>;
  readonly mostConsistentDay: DayOfWeek | null;
}

const SHORT_DAYS: Record<DayOfWeek, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const BAR_HEIGHT_THRESHOLDS: readonly [number, string][] = [
  [90, 'h-full'],
  [80, 'h-5/6'],
  [70, 'h-3/4'],
  [60, 'h-2/3'],
  [50, 'h-1/2'],
  [40, 'h-2/5'],
  [30, 'h-1/3'],
  [20, 'h-1/4'],
  [15, 'h-1/6'],
  [1, 'h-2'],
];

function getBarHeightClass(percent: number): string {
  const match = BAR_HEIGHT_THRESHOLDS.find(([threshold]) => percent >= threshold);
  return match ? match[1] : 'h-1';
}

export function WeeklyDistributionChart({
  distribution,
  mostConsistentDay,
}: WeeklyDistributionChartProps) {
  const values = Object.values(distribution);
  const maxCompletions = Math.max(...values, 1);

  return (
    <div
      data-testid="analytics-chart"
      className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-base font-bold text-text">Daily Completion Distribution</h3>
          <p className="text-xs text-text-muted">Habits completed across Monday to Sunday</p>
        </div>
      </div>

      <div className="mt-8 flex h-48 items-end justify-between gap-2 sm:gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const count = distribution[day] ?? 0;
          const heightPercent = Math.max(Math.round((count / maxCompletions) * 100), 8);
          const isTopDay = day === mostConsistentDay;
          const heightClass = getBarHeightClass(heightPercent);

          return (
            <div key={day} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-mono font-bold text-text">{count}</span>

              <div className="relative flex w-full max-w-11 flex-1 items-end justify-center rounded-t-lg bg-surface-subtle p-1">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${heightClass} ${
                    isTopDay
                      ? 'bg-gradient-to-t from-primary to-streak-fire shadow-md'
                      : count > 0
                        ? 'bg-primary'
                        : 'bg-surface-elevated'
                  }`}
                  aria-label={`${day}: ${count} completions`}
                />
              </div>

              <span
                className={`text-xs font-medium ${
                  isTopDay ? 'font-bold text-primary' : 'text-text-muted'
                }`}
              >
                {SHORT_DAYS[day]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
