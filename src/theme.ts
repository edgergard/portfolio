import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/** localStorage key for an explicit choice; index.html reads the same key before first paint. */
export const THEME_KEY = 'theme';

/** The site opens dark unless the visitor picked light earlier (the system setting is ignored). */
export const DEFAULT_THEME: Theme = 'dark';

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

/** The visitor's explicit choice, or null when they never picked one (or storage is blocked). */
export const storedTheme = (): Theme | null => {
  try {
    const value = window.localStorage.getItem(THEME_KEY);

    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
};

export const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
};

/** What the page should show now: a saved choice, otherwise dark. */
export const resolveTheme = (): Theme => storedTheme() ?? DEFAULT_THEME;

const currentTheme = (): Theme => {
  const value = document.documentElement.dataset.theme;

  return isTheme(value) ? value : resolveTheme();
};

/**
 * The theme on <html>, kept in sync when it changes (for parts that can't read CSS variables,
 * like the hero's 3D material). Read-only: use useTheme() to switch.
 */
export const useCurrentTheme = () => {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(currentTheme()));

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  return theme;
};

/**
 * The current theme and a toggle; the visitor's choice is saved. Every instance reads the theme
 * from <html> (the header has one toggle for desktop and one for mobile), so they never disagree.
 */
export const useTheme = () => {
  const theme = useCurrentTheme();

  const toggle = useCallback(() => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';

    applyTheme(next);

    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage blocked: the choice lasts for this page view only.
    }
  }, []);

  return { theme, toggle };
};
