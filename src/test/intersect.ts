import { vi } from 'vitest';

/**
 * Swaps the never-firing IntersectionObserver stub from vitest.setup for one that reports every
 * observed element as on screen at once (for parts that load when scrolled near, like the contact
 * form). Restored by vi.unstubAllGlobals().
 */
export const intersectEverything = () => {
  class Immediate {
    constructor(private readonly callback: IntersectionObserverCallback) {}

    observe(target: Element) {
      this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as never);
    }

    unobserve() {}

    disconnect() {}

    takeRecords() {
      return [];
    }
  }

  vi.stubGlobal('IntersectionObserver', Immediate);
};
