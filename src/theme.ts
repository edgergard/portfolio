import { useCallback } from 'react';
import { THEME_COLORS } from './lib/theme-script';
import { useClientValue } from './utils/clientValue';

export type Theme = 'light' | 'dark';

/** localStorage key and cookie name for an explicit choice; the pre-paint script reads both. */
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

/** Sets the theme on <html> and the matching browser UI colour (status bar on phones). */
export const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
};

/** What the page should show now: a saved choice, otherwise dark. */
export const resolveTheme = (): Theme => storedTheme() ?? DEFAULT_THEME;

/** The theme on <html> right now (for code outside React, e.g. the shared wine renderer). */
export const currentTheme = (): Theme => {
  const value = document.documentElement.dataset.theme;

  return isTheme(value) ? value : resolveTheme();
};

const subscribeTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return () => observer.disconnect();
};

/**
 * The theme on <html>, kept in sync when it changes (for parts that can't read CSS variables,
 * like the hero's 3D material). Read-only: use useTheme() to switch. Dark while the prerendered
 * home page hydrates (the HTML is built dark), then the real theme.
 */
export const useCurrentTheme = () => useClientValue(subscribeTheme, currentTheme, DEFAULT_THEME);

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
      // Storage blocked: the cookie below still keeps the choice.
    }

    // The cookie lets the server-rendered page and the pre-paint script see the choice too.
    document.cookie = `${THEME_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  return { theme, toggle };
};
