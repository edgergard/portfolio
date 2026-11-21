import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/** localStorage key for an explicit choice; index.html reads the same key before first paint. */
export const THEME_KEY = 'theme';

const LIGHT_QUERY = '(prefers-color-scheme: light)';

const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

/** The system's colour scheme; dark when it can't be read. */
export const systemTheme = (): Theme =>
  typeof window.matchMedia === 'function' && window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark';

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

/** What the page should show now: a saved choice wins, otherwise the system setting. */
export const resolveTheme = (): Theme => storedTheme() ?? systemTheme();

/**
 * The current theme and a toggle. Without a saved choice the site follows the system setting,
 * live; once the visitor toggles, their choice is saved and wins from then on.
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const current = document.documentElement.dataset.theme;

    return isTheme(current) ? current : resolveTheme();
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const query = window.matchMedia(LIGHT_QUERY);
    const onChange = () => {
      if (storedTheme() === null) {
        setTheme(systemTheme());
      }
    };

    query.addEventListener?.('change', onChange);

    return () => query.removeEventListener?.('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';

      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        // Storage blocked: the choice lasts for this page view only.
      }

      return next;
    });
  }, []);

  return { theme, toggle };
};
