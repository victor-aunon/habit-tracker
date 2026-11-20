import { AlertCircle, X } from 'lucide-react';

export interface ToastBannerProps {
  readonly message: string | null;
  readonly type?: 'error' | 'warning' | 'info';
  readonly onDismiss?: () => void;
  readonly testId?: string;
}

export function ToastBanner({
  message,
  type = 'warning',
  onDismiss,
  testId = 'storage-error-alert',
}: ToastBannerProps) {
  if (!message) {
    return null;
  }

  const borderClass =
    type === 'error'
      ? 'border-danger/30 bg-danger-subtle text-danger-foreground'
      : type === 'warning'
        ? 'border-warning/30 bg-warning-subtle text-warning-foreground'
        : 'border-info/30 bg-info-subtle text-text';

  return (
    <aside
      role="alert"
      aria-live="polite"
      data-testid={testId}
      className={`fixed bottom-4 right-4 z-50 flex max-w-md items-center gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-md ${borderClass}`}
    >
      <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
