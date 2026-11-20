import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportImportModal } from '../../src/features/habits/backup/ui/ExportImportModal';

describe('ExportImportModal Integration', () => {
  it('does not render when isOpen is false', () => {
    render(
      <ExportImportModal
        isOpen={false}
        onClose={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );
    expect(screen.queryByTestId('backup-modal')).toBeNull();
  });

  it('renders modal with export and import controls when open', () => {
    render(
      <ExportImportModal
        isOpen={true}
        onClose={vi.fn()}
        onExport={vi.fn()}
        onImport={vi.fn()}
      />,
    );
    expect(screen.getByTestId('backup-modal')).toBeDefined();
    expect(screen.getByTestId('export-backup-button')).toBeDefined();
    expect(screen.getByTestId('import-backup-input')).toBeDefined();
  });

  it('calls onExport when clicking export button', () => {
    const onExport = vi.fn();
    render(
      <ExportImportModal
        isOpen={true}
        onClose={vi.fn()}
        onExport={onExport}
        onImport={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('export-backup-button'));
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('handles file upload and calls onImport with file content', async () => {
    const onImport = vi.fn().mockResolvedValue({ success: true, message: 'Restored successfully' });
    const onClose = vi.fn();

    render(
      <ExportImportModal
        isOpen={true}
        onClose={onClose}
        onExport={vi.fn()}
        onImport={onImport}
      />,
    );

    const validJson = JSON.stringify({
      version: 1,
      exportedAt: '2026-11-19T00:00:00.000Z',
      habits: [],
      completions: [],
    });

    const file = new File([validJson], 'backup.json', { type: 'application/json' });
    const input = screen.getByTestId('import-backup-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByTestId('import-submit-button')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('import-submit-button'));

    await waitFor(() => {
      expect(onImport).toHaveBeenCalledWith(validJson);
    });
  });

  it('displays error feedback when onImport returns failure', async () => {
    const onImport = vi.fn().mockResolvedValue({
      success: false,
      message: 'Invalid backup file structure',
    });

    render(
      <ExportImportModal
        isOpen={true}
        onClose={vi.fn()}
        onExport={vi.fn()}
        onImport={onImport}
      />,
    );

    const invalidContent = '{"invalid": true}';
    const file = new File([invalidContent], 'bad.json', { type: 'application/json' });
    const input = screen.getByTestId('import-backup-input');

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByTestId('import-submit-button')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('import-submit-button'));

    await waitFor(() => {
      expect(screen.getByTestId('backup-error-message')).toBeDefined();
      expect(screen.getByTestId('backup-error-message').textContent).toContain(
        'Invalid backup file structure',
      );
    });
  });
});
