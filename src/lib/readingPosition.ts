/**
 * Keeps the visitor's place across a language switch (a full page load): before leaving, note
 * the section at the top of the screen and how far into it they are; on the new page, scroll
 * back there. Section-relative, because the two languages lay out to slightly different heights.
 * Pages without sections (CV, archive) fall back to the same share of the page.
 */
const KEY = 'locale-switch-position';
/** Only a switch that lands within this time is restored (a stale entry is dropped). */
const MAX_AGE_MS = 15_000;
/** The sticky header covers the top of the screen. */
const HEADER = 80;

type Saved = { path: string; at: number; id?: string; offset?: number; share?: number };

/** The section whose top is at or above the header line: the one being read. */
const currentSection = () => {
  let current: HTMLElement | undefined;

  for (const el of document.querySelectorAll<HTMLElement>('main section[id]')) {
    if (el.getBoundingClientRect().top <= HEADER) {
      current = el;
    }
  }

  return current;
};

/** Notes the reading position for `path`, the page the switch is about to load. */
export const saveReadingPosition = (path: string) => {
  try {
    const section = currentSection();
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const saved: Saved = section
      ? { path, at: Date.now(), id: section.id, offset: -section.getBoundingClientRect().top }
      : { path, at: Date.now(), share: max > 0 ? window.scrollY / max : 0 };

    sessionStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // Storage blocked: the switch still works, it just starts at the top.
  }
};

/** Scrolls back to a position saved for this page by the switch, once. */
export const restoreReadingPosition = (path: string) => {
  let saved: Saved | null = null;

  try {
    saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Saved | null;
    sessionStorage.removeItem(KEY);
  } catch {
    return;
  }

  if (!saved || saved.path !== path || Date.now() - saved.at > MAX_AGE_MS) {
    return;
  }

  const target = saved.id ? document.getElementById(saved.id) : null;
  const top = target
    ? target.getBoundingClientRect().top + window.scrollY + (saved.offset ?? 0)
    : (saved.share ?? 0) * (document.documentElement.scrollHeight - window.innerHeight);

  window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
};
