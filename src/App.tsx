import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
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
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const s = loadSettings();
    if (s.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return s.theme;
  });

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    const nextSettings = { ...settings, theme: next };
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 overflow-y-auto">
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
    </div>
  );
}