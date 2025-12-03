'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ThemePref = 'light' | 'dark' | 'system';
type ThemeApplied = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeApplied;
  toggleTheme: () => void;
  setPreference: (pref: ThemePref) => void;
  preference: ThemePref;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePref>('light');
  const [theme, setTheme] = useState<ThemeApplied>('light');

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as ThemePref) || 'system';
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (pref: ThemePref) => {
      const applied: ThemeApplied = pref === 'system' ? (mql.matches ? 'dark' : 'light') : (pref as ThemeApplied);
      setPreference(pref);
      setTheme(applied);
      document.documentElement.classList.toggle('dark', applied === 'dark');
      document.body.classList.toggle('dark', applied === 'dark');
    };
    apply(saved);
    const handler = (e: MediaQueryListEvent) => {
      if (preference === 'system') {
        const applied: ThemeApplied = e.matches ? 'dark' : 'light';
        setTheme(applied);
        document.documentElement.classList.toggle('dark', applied === 'dark');
        document.body.classList.toggle('dark', applied === 'dark');
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    const next: ThemeApplied = theme === 'light' ? 'dark' : 'light';
    setPreference(next);
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.body.classList.toggle('dark', next === 'dark');
  };

  const setPreferenceHandler = (pref: ThemePref) => {
    setPreference(pref);
    localStorage.setItem('theme', pref);
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const applied: ThemeApplied = pref === 'system' ? (mql.matches ? 'dark' : 'light') : (pref as ThemeApplied);
    setTheme(applied);
    document.documentElement.classList.toggle('dark', applied === 'dark');
    document.body.classList.toggle('dark', applied === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setPreference: setPreferenceHandler, preference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
}
