import { afterEach, describe, expect, it } from 'vitest';
import html from '../../index.html?raw';
import main from '../main.tsx?raw';

/** Runs index.html's pre-paint script against the given storage and URL hash. */
const prepaint = (locale: string | null, hash: string) => {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)![1];

  localStorage.clear();

  if (locale) {
    localStorage.setItem('locale', locale);
  }

  window.location.hash = hash;
  new Function(script)();

  return document.documentElement.dataset.skipPrerender;
};

describe('pre-paint script and the prerendered English home page', () => {
  afterEach(() => {
    delete document.documentElement.dataset.skipPrerender;
    localStorage.clear();
    window.location.hash = '';
  });

  it('hides it from a Ukrainian visitor before first paint', () => {
    expect(prepaint('ua', '')).toBe('');
  });

  it('hides it on a deep link to the CV or the archive', () => {
    expect(prepaint(null, '#/cv')).toBe('');
    expect(prepaint('en', '#/projects')).toBe('');
  });

  it('shows it to an English visitor on the home page, section anchors included', () => {
    expect(prepaint(null, '')).toBeUndefined();
    expect(prepaint('en', '#contact')).toBeUndefined();
  });

  it('hides it with CSS, and the client entry lifts the flag after it renders fresh', () => {
    expect(html).toMatch(/html\[data-skip-prerender\] #root > \*\s*\{\s*display: none;?\s*\}/);
    expect(main).toContain('delete document.documentElement.dataset.skipPrerender');
  });
});
