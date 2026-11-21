import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import html from '../index.html?raw';
import './i18n';
import ThemeButton from './components/Header/ThemeButton';
import { resolveTheme, THEME_KEY } from './theme';

let systemLight = false;
let listeners: Array<() => void> = [];

const stubMatchMedia = () =>
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('light') ? systemLight : false,
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.push(cb),
    removeEventListener: (_: string, cb: () => void) => {
      listeners = listeners.filter((l) => l !== cb);
    },
  }));

describe('theme', () => {
  beforeEach(() => {
    systemLight = false;
    listeners = [];
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    stubMatchMedia();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to the system theme when the visitor never chose one', () => {
    systemLight = true;
    expect(resolveTheme()).toBe('light');
    systemLight = false;
    expect(resolveTheme()).toBe('dark');
  });

  it('prefers a saved choice over the system theme', () => {
    systemLight = true;
    localStorage.setItem(THEME_KEY, 'dark');
    expect(resolveTheme()).toBe('dark');
  });

  it('toggles the theme on <html> and saves the choice', async () => {
    render(<ThemeButton />);
    expect(document.documentElement.dataset.theme).toBe('dark');

    await userEvent.click(screen.getByTestId('theme-toggle'));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(screen.getByTestId('theme-toggle')).toHaveAccessibleName('Switch to dark theme');
  });

  it('follows live system changes until the visitor picks a theme', () => {
    render(<ThemeButton />);
    systemLight = true;
    act(() => listeners.forEach((l) => l()));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('sets the theme before first paint from the saved choice or the system setting', () => {
    const head = html.slice(0, html.indexOf('</head>'));

    expect(head).toMatch(/localStorage\.getItem\('theme'\)/);
    expect(head).toMatch(/prefers-color-scheme: light/);
    expect(head).toMatch(/dataset\.theme/);
  });
});
