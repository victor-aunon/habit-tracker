import type { ReactNode } from 'react';

export interface WeeklyMetricCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly subtitle?: string;
  readonly icon?: ReactNode;
  readonly variant?: 'default' | 'success' | 'highlight';
  readonly testId?: string;
}

export function WeeklyMetricCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  testId,
}: WeeklyMetricCardProps) {
  const borderAccent =
    variant === 'success'
      ? 'border-t-4 border-t-success'
      : variant === 'highlight'
        ? 'border-t-4 border-t-streak-fire'
        : 'border-t-4 border-t-primary';

  return (
    <div
      data-testid={testId}
      className={`relative rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:bg-surface-hover ${borderAccent}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </span>
        {icon && <span className="text-text-secondary">{icon}</span>}
      </div>

      <div className="mt-3">
        <span className="text-3xl font-extrabold tracking-tight text-text font-mono">{value}</span>
        {subtitle && <p className="mt-1 text-xs text-text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
