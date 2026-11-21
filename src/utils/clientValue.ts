'use client';

import { useSyncExternalStore } from 'react';

/**
 * A browser value (theme, a media query, page visibility) that is safe to read while the home page
 * is prerendered and hydrated: the server and the hydration pass use `serverValue`, and the real
 * value takes over right after, so the first client render matches the prerendered HTML.
 * Outside hydration (a normal client render) the real value is used from the first frame.
 */
export const useClientValue = <T>(
  subscribe: (onChange: () => void) => () => void,
  getSnapshot: () => T,
  serverValue: T,
): T => useSyncExternalStore(subscribe, getSnapshot, () => serverValue);

/** Subscribe/snapshot pair for a CSS media query, for useClientValue. */
export const mediaQuery = (query: string) => ({
  subscribe: (onChange: () => void) => {
    const list = window.matchMedia(query);

    list.addEventListener?.('change', onChange);

    return () => list.removeEventListener?.('change', onChange);
  },
  getSnapshot: () => window.matchMedia(query).matches,
});
