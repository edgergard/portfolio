import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import html from '../index.html?raw';
import './i18n';
import ThemeButton from './components/Header/ThemeButton';
import { resolveTheme, THEME_KEY, useCurrentTheme } from './theme';

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
    document.cookie = 'theme=; path=/; max-age=0';
    delete document.documentElement.dataset.theme;
    stubMatchMedia();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('defaults to dark, even when the system prefers light', () => {
    systemLight = true;
    expect(resolveTheme()).toBe('dark');
  });

  it('uses a saved choice', () => {
    localStorage.setItem(THEME_KEY, 'light');
    expect(resolveTheme()).toBe('light');
  });

  it('toggles the theme on <html> and saves the choice', async () => {
    render(<ThemeButton />);
    expect(screen.getByTestId('theme-toggle')).toHaveAccessibleName('Switch to light theme');

    await userEvent.click(screen.getByTestId('theme-toggle'));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(await screen.findByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
  });

  it('also saves the choice in a cookie so the server-rendered page can read it', async () => {
    const setCookie = vi.spyOn(document, 'cookie', 'set');

    render(<ThemeButton />);
    await userEvent.click(screen.getByTestId('theme-toggle'));
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(setCookie).toHaveBeenCalledWith('theme=light; path=/; max-age=31536000; samesite=lax');
    expect(document.cookie).toContain('theme=light');
  });

  it('reports theme changes to readers like the 3D knot', async () => {
    const Reader = () => <span data-testid="reader">{useCurrentTheme()}</span>;

    render(<><ThemeButton /><Reader /></>);
    expect(screen.getByTestId('reader')).toHaveTextContent('dark');
    await userEvent.click(screen.getByTestId('theme-toggle'));
    expect(await screen.findByText('light')).toBeInTheDocument();
  });

  it('keeps both header toggles in sync (one shows on desktop, one on mobile)', async () => {
    render(<><ThemeButton /><ThemeButton /></>);
    const [desktop, mobile] = screen.getAllByTestId('theme-toggle');

    await userEvent.click(mobile);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(await screen.findAllByRole('button', { name: 'Switch to dark theme' })).toHaveLength(2);
    await userEvent.click(desktop);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('sets the theme before first paint from the saved choice, dark otherwise', () => {
    const head = html.slice(0, html.indexOf('</head>'));

    expect(head).toMatch(/localStorage\.getItem\('theme'\)/);
    expect(head).not.toMatch(/prefers-color-scheme/);
    expect(head).toMatch(/t === 'light' \? 'light' : 'dark'/);
  });
});
