import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { HABIT_CATEGORIES } from '../domain/Habit';

export interface HabitFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: {
    title: string;
    description?: string;
    category: string;
  }) => Promise<boolean>;
  readonly existingTitles: string[];
}

export function HabitFormModal({ isOpen, onClose, onSubmit, existingTitles }: HabitFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      setErrorMessage('Habit title must be between 1 and 100 characters.');
      return;
    }

    if (trimmedTitle.length > 100) {
      setErrorMessage('Habit title cannot exceed 100 characters.');
      return;
    }

    const normalizedNew = trimmedTitle.toLowerCase();
    const isDuplicate = existingTitles.some((t) => t.trim().toLowerCase() === normalizedNew);
    if (isDuplicate) {
      setErrorMessage('A habit with this title already exists.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        title: trimmedTitle,
        description: description.trim() || undefined,
        category,
      });

      if (success) {
        setTitle('');
        setDescription('');
        setCategory('other');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="habit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="habit-modal-title" className="text-lg font-bold text-text">
              Create New Habit
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="habit-title-input" className="block text-sm font-medium text-text">
              Habit Title <span className="text-danger">*</span>
            </label>
            <input
              id="habit-title-input"
              type="text"
              data-testid="habit-input-title"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Read 30 Mins, Drink 2L Water"
              maxLength={105}
              className="mt-1 block w-full rounded-xl border border-border bg-surface-subtle px-4 py-2.5 text-sm text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-1 flex justify-between text-xs text-text-muted">
              <span>Must be between 1 and 100 characters.</span>
              <span>{title.trim().length}/100</span>
            </div>
          </div>

          <div>
            <label htmlFor="habit-category-select" className="block text-sm font-medium text-text">
              Category
            </label>
            <select
              id="habit-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-border bg-surface-subtle px-4 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {HABIT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="habit-desc-input" className="block text-sm font-medium text-text">
              Notes / Description (Optional)
            </label>
            <textarea
              id="habit-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add optional notes or motivation cues (max 250 characters)"
              rows={3}
              maxLength={250}
              className="mt-1 block w-full rounded-xl border border-border bg-surface-subtle px-4 py-2 text-sm text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-xs font-semibold text-danger">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="habit-submit-button"
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
