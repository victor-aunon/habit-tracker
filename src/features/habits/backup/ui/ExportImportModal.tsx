import { useState, useRef } from 'react';
import { X, Download, Upload, AlertCircle, FileJson, CheckCircle2 } from 'lucide-react';

export interface ExportImportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onExport: () => void;
  readonly onImport: (jsonContent: string) => Promise<{ success: boolean; message: string }>;
}

export function ExportImportModal({
  isOpen,
  onClose,
  onExport,
  onImport,
}: ExportImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const content = await selectedFile.text();
      const result = await onImport(content);

      if (result.success) {
        setSuccessMessage(result.message);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to read the selected file.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
      data-testid="backup-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="backup-modal-title" className="text-lg font-bold text-text">
              Data Backup & Portability
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Feedback Banners */}
        {errorMessage && (
          <div
            data-testid="backup-error-message"
            className="mt-4 flex items-center gap-2 rounded-xl bg-danger/10 p-3 text-xs font-medium text-danger"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            data-testid="backup-success-message"
            className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 p-3 text-xs font-medium text-success"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="mt-5 space-y-6">
          {/* Section 1: Export */}
          <section className="rounded-xl border border-border bg-surface-subtle p-4">
            <h3 className="text-sm font-semibold text-text">Export Backup</h3>
            <p className="mt-1 text-xs text-text-muted">
              Download a JSON file containing all your habits and completion history to keep a backup or
              transfer to another device.
            </p>
            <button
              type="button"
              onClick={onExport}
              data-testid="export-backup-button"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-surface border border-border px-3.5 py-2 text-xs font-semibold text-text shadow-sm hover:bg-surface-hover hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Download className="h-4 w-4 text-primary" aria-hidden="true" />
              Download Backup (JSON)
            </button>
          </section>

          {/* Section 2: Import */}
          <section className="rounded-xl border border-border bg-surface-subtle p-4">
            <h3 className="text-sm font-semibold text-text">Import Backup</h3>
            <p className="mt-1 text-xs text-text-muted">
              Select a previously exported JSON backup file. This action will restore and replace the
              current data in this browser.
            </p>

            <form onSubmit={handleImportSubmit} className="mt-3 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                data-testid="import-backup-input"
                className="block w-full text-xs text-text-muted file:mr-3 file:rounded-lg file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-text hover:file:bg-surface-hover focus:outline-none"
              />

              {selectedFile && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    data-testid="import-submit-button"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary-hover disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                    {isProcessing ? 'Restoring...' : 'Restore Backup'}
                  </button>
                </div>
              )}
            </form>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-surface-hover"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
