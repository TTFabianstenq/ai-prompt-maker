import { cn } from '@/lib/utils';
import type { Page } from '@/types';
import {
  Sparkles,
  Wand2,
  Library,
  LayoutTemplate,
  Settings,
  Moon,
  Sun,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAV_ITEMS: { id: Page; label: string; short: string; icon: React.ElementType }[] = [
  { id: 'generator', label: 'Prompt Generator', short: 'Generate', icon: Sparkles },
  { id: 'improver', label: 'Prompt Improver', short: 'Improve', icon: Wand2 },
  { id: 'library', label: 'Prompt Library', short: 'Library', icon: Library },
  { id: 'templates', label: 'Templates', short: 'Templates', icon: LayoutTemplate },
  { id: 'settings', label: 'Settings', short: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate, theme, onToggleTheme, mobileOpen, onMobileClose }: SidebarProps) {
  const handleNav = (page: Page) => {
    onNavigate(page);
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      {/* Desktop sidebar + mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-200 md:static md:z-auto md:w-64 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4 md:px-5 md:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">AI Prompt Maker</h1>
              <p className="text-xs text-muted-foreground">Professional Edition</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <p className="mt-2 px-3 text-[11px] text-muted-foreground/70">
            Local-first · Demo Mode ready
          </p>
        </div>
      </aside>
    </>
  );
}

/** Bottom tab bar — phones only */
export function MobileBottomNav({
  currentPage,
  onNavigate,
}: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}) {
  const items = NAV_ITEMS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-md md:hidden safe-bottom">
      <div className="flex items-stretch justify-around px-1 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="truncate">{item.short}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
