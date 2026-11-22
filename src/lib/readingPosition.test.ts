import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { restoreReadingPosition, saveReadingPosition } from './readingPosition';

const KEY = 'locale-switch-position';

/** A section whose viewport top is `top` (jsdom has no layout). */
const section = (id: string, top: number) => {
  const el = document.createElement('section');

  el.id = id;
  el.getBoundingClientRect = () => ({ top } as DOMRect);
  document.querySelector('main')!.append(el);

  return el;
};

describe('reading position across a language switch', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main></main>';
    sessionStorage.clear();
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  afterEach(() => vi.restoreAllMocks());

  it('saves the section being read and how far into it the visitor is', () => {
    section('about', -900);
    section('projects', -150);
    section('contact', 600);
    saveReadingPosition('/uk');
    expect(JSON.parse(sessionStorage.getItem(KEY)!)).toMatchObject({ path: '/uk', id: 'projects', offset: 150 });
  });

  it('restores to the same section and offset on the new page, once', () => {
    sessionStorage.setItem(KEY, JSON.stringify({ path: '/uk', at: Date.now(), id: 'projects', offset: 150 }));
    section('projects', 400);
    Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true });
    restoreReadingPosition('/uk');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1550, behavior: 'instant' });
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it('ignores an entry for another page or a stale one', () => {
    sessionStorage.setItem(KEY, JSON.stringify({ path: '/uk/cv/frontend', at: Date.now(), share: 0.5 }));
    restoreReadingPosition('/uk');
    sessionStorage.setItem(KEY, JSON.stringify({ path: '/uk', at: Date.now() - 60_000, share: 0.5 }));
    restoreReadingPosition('/uk');
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('falls back to the same share of the page where there are no sections', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 3000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
    sessionStorage.setItem(KEY, JSON.stringify({ path: '/uk/cv/frontend', at: Date.now(), share: 0.25 }));
    restoreReadingPosition('/uk/cv/frontend');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 500, behavior: 'instant' });
  });
});
