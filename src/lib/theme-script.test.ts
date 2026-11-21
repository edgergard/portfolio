import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { THEME_SCRIPT } from './theme-script';

const run = () => new Function(THEME_SCRIPT)();

describe('THEME_SCRIPT (pre-paint theme)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'theme=; path=/; max-age=0';
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    document.cookie = 'theme=; path=/; max-age=0';
  });

  it('uses the saved localStorage choice', () => {
    localStorage.setItem('theme', 'light');
    run();
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('defaults to dark when nothing is stored', () => {
    run();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('falls back to the theme cookie when localStorage is empty', () => {
    document.cookie = 'theme=light';
    run();
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('prefers localStorage over the cookie', () => {
    localStorage.setItem('theme', 'dark');
    document.cookie = 'theme=light';
    run();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('ignores the system colour scheme', () => {
    expect(THEME_SCRIPT).not.toMatch(/prefers-color-scheme/);
  });
});
