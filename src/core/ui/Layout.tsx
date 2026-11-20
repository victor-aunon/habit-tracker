import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { ToastBanner } from './ToastBanner';
import { ErrorBoundary } from './ErrorBoundary';

export interface LayoutProps {
  readonly children: ReactNode;
  readonly currentRoute?: string;
  readonly onNavigate?: (route: string) => void;
  readonly toastMessage?: string | null;
  readonly onDismissToast?: () => void;
  readonly onOpenBackupModal?: () => void;
}

export function Layout({
  children,
  currentRoute = '/',
  onNavigate,
  toastMessage = null,
  onDismissToast,
  onOpenBackupModal,
}: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-text antialiased">
      <Navbar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        onOpenBackupModal={onOpenBackupModal}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>

      <ToastBanner message={toastMessage} onDismiss={onDismissToast} />
    </div>
  );
}
