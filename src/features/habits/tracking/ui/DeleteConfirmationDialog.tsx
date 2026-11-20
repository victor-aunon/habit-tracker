import { AlertTriangle, Trash2 } from 'lucide-react';

export interface DeleteConfirmationDialogProps {
  readonly isOpen: boolean;
  readonly habitTitle: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly isDeleting?: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  habitTitle,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      data-testid="delete-confirm-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-danger">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-subtle">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 id="delete-dialog-title" className="text-lg font-bold text-text">
            Delete Habit
          </h2>
        </div>

        <p className="mt-3 text-sm text-text-muted">
          Are you sure you want to delete{' '}
          <strong className="text-text font-semibold">"{habitTitle}"</strong>? This habit will be
          removed from your dashboard. Historical completion records will be archived.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            data-testid="delete-cancel-button"
            className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            data-testid="delete-confirm-button"
            className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-danger-foreground shadow hover:bg-danger-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {isDeleting ? 'Deleting...' : 'Delete Habit'}
          </button>
        </div>
      </div>
    </div>
  );
}
