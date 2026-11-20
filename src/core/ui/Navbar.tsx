import { CheckSquare, Calendar, BarChart2, FileJson } from 'lucide-react';

export interface NavbarProps {
  readonly currentRoute?: string;
  readonly onNavigate?: (route: string) => void;
  readonly onOpenBackupModal?: () => void;
}

export function Navbar({ currentRoute = '/', onNavigate, onOpenBackupModal }: NavbarProps) {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: CheckSquare },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Analytics', path: '/analytics', icon: BarChart2 },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <CheckSquare className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-text">Habit Tracker</span>
            <span className="ml-2 hidden rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-medium text-primary sm:inline">
              Daily & Streaks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <nav aria-label="Main Navigation" className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.path;

              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-subtle text-primary'
                      : 'text-text-muted hover:bg-surface-hover hover:text-text'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {onOpenBackupModal && (
            <button
              type="button"
              onClick={onOpenBackupModal}
              data-testid="navbar-backup-button"
              aria-label="Data backup and portability"
              title="Backup / Export / Import"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text hover:bg-surface-hover hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <FileJson className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="hidden md:inline">Backup</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
