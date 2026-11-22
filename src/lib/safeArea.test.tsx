import { describe, expect, it, beforeEach } from 'vitest';
import { applyTheme } from '@/theme';
import { DEBUG_SCRIPT } from './debug-script';
import { THEME_COLORS, THEME_SCRIPT } from './theme-script';
import { SITE_VIEWPORT as viewport } from './metadata';

const meta = () => document.querySelector('meta[name="theme-color"]')!;

describe('phone status bar', () => {
  beforeEach(() => {
    document.head.innerHTML = `<meta name="theme-color" content="${THEME_COLORS.dark}">`;
    document.cookie = 'theme=; max-age=0; path=/';
    localStorage.clear();
  });

  it('lets the page run under the status bar (the header pads by the safe-area inset)', () => {
    expect(viewport).toMatchObject({ width: 'device-width', initialScale: 1, viewportFit: 'cover' });
  });

  it('tints the status bar with the header colour, following the site theme', () => {
    applyTheme('light');
    expect(meta()).toHaveAttribute('content', THEME_COLORS.light);
    applyTheme('dark');
    expect(meta()).toHaveAttribute('content', THEME_COLORS.dark);
  });

  it('pre-paint script switches the colour for a saved light theme and keeps dark otherwise', () => {
    new Function(THEME_SCRIPT)();
    expect(meta()).toHaveAttribute('content', THEME_COLORS.dark);
    localStorage.setItem('theme', 'light');
    new Function(THEME_SCRIPT)();
    expect(meta()).toHaveAttribute('content', THEME_COLORS.light);
  });
});

describe('debug script', () => {
  it('does nothing without ?debug', () => {
    delete (window as { __dbg?: unknown }).__dbg;
    new Function(DEBUG_SCRIPT)();
    expect((window as { __dbg?: unknown }).__dbg).toBeUndefined();
  });

  it('starts collecting with ?debug', () => {
    window.history.replaceState(null, '', '/?debug');
    new Function(DEBUG_SCRIPT)();
    expect((window as { __dbg?: unknown }).__dbg).toBeDefined();
    window.history.replaceState(null, '', '/');
  });
});
