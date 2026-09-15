import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar, MobileBottomNav } from '@/components/Sidebar';
import { GeneratorPage } from '@/pages/GeneratorPage';
import { ImproverPage } from '@/pages/ImproverPage';
import { LibraryPage } from '@/pages/LibraryPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { loadSettings, saveSettings } from '@/lib/storage';
import type { AppSettings, Page } from '@/types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('generator');
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const s = loadSettings();
    if (s.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return s.theme === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = () => {
      if (mq.matches) setMobileMenuOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleToggleTheme = () => {
    const next: 'dark' | 'light' = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    const nextSettings: AppSettings = { ...settings, theme: next };
    setSettings(nextSettings);
    saveSettings(nextSettings);
  };

  const handleSettingsChange = (next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
    if (next.theme !== 'system') {
      setTheme(next.theme);
    }
  };

  const pageTitles: Record<Page, string> = {
    generator: 'Prompt Generator',
    improver: 'Prompt Improver',
    library: 'Prompt Library',
    templates: 'Templates',
    settings: 'Settings',
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-border px-3 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="truncate text-sm font-semibold">{pageTitles[currentPage]}</h1>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {currentPage === 'generator' && (
            <GeneratorPage settings={settings} onNavigate={setCurrentPage} />
          )}
          {currentPage === 'improver' && <ImproverPage settings={settings} />}
          {currentPage === 'library' && <LibraryPage settings={settings} />}
          {currentPage === 'templates' && (
            <TemplatesPage settings={settings} onNavigate={setCurrentPage} />
          )}
          {currentPage === 'settings' && (
            <SettingsPage settings={settings} onSettingsChange={handleSettingsChange} />
          )}
        </main>

        <MobileBottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
    </div>
  );
}
