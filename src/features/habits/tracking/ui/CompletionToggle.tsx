import { useState } from 'react';
import { Check } from 'lucide-react';

export interface CompletionToggleProps {
  readonly isCompleted: boolean;
  readonly onToggle: () => void;
  readonly disabled?: boolean;
  readonly habitTitle: string;
  readonly 'data-testid'?: string;
}

export function CompletionToggle({
  isCompleted,
  onToggle,
  disabled = false,
  habitTitle,
  'data-testid': testId = 'habit-toggle-button',
}: CompletionToggleProps) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    if (!isCompleted) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 550);
    }
    onToggle();
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Energy Sparks Burst System */}
      {animating && (
        <div
          data-testid="completion-sparks"
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          aria-hidden="true"
        >
          {/* Radiating aura pulse ring */}
          <span className="absolute inset-0 -m-1.5 rounded-2xl bg-success/40 animate-pulse-ring" />

          {/* 8 physical spark rays with distinct trajectories and luminous contrast */}
          <span className="absolute h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-300 animate-spark-0" />
          <span className="absolute h-2 w-2 rounded-sm rotate-45 bg-amber-300 shadow-sm shadow-amber-200 animate-spark-45" />
          <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-sm shadow-emerald-200 animate-spark-90" />
          <span className="absolute h-1.5 w-1.5 rounded-sm rotate-12 bg-teal-200 shadow-sm shadow-teal-100 animate-spark-135" />
          <span className="absolute h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-300 animate-spark-180" />
          <span className="absolute h-2 w-2 rounded-sm rotate-45 bg-amber-300 shadow-sm shadow-amber-200 animate-spark-225" />
          <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-sm shadow-emerald-200 animate-spark-270" />
          <span className="absolute h-1.5 w-1.5 rounded-sm rotate-12 bg-teal-200 shadow-sm shadow-teal-100 animate-spark-315" />
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={isCompleted}
        aria-label={`Mark ${habitTitle} as ${isCompleted ? 'incomplete' : 'completed'} for today`}
        data-testid={testId}
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          isCompleted
            ? 'border-success bg-success text-success-foreground shadow-sm shadow-success/25'
            : 'border-border bg-surface hover:border-text-secondary hover:bg-surface-hover text-transparent'
        }`}
      >
        <Check
          className={`h-5 w-5 transition-transform duration-200 ${
            isCompleted ? 'scale-100 opacity-100 animate-check' : 'scale-75 opacity-0'
          }`}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
