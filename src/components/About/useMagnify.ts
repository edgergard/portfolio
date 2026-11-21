import { useEffect, type RefObject } from 'react';

/** Distance (CSS px) from the pointer at which a chip stops growing. */
export const MAGNIFY_RADIUS = 120;

type Center = { el: HTMLElement; x: number; y: number };

/**
 * Smooth 0..1 falloff with distance: 1 under the pointer, 0 at MAGNIFY_RADIUS and beyond.
 * Vertical distance counts a little more, so the lens reads as a soft horizontal bubble.
 */
export const magnifyAt = (dx: number, dy: number) => {
  const k = Math.max(0, 1 - Math.hypot(dx, dy * 1.3) / MAGNIFY_RADIUS);

  return k * k * (3 - 2 * k);
};

/**
 * A dock-like lens over chips: while a fine pointer moves over `root`, every `[data-chip]` inside
 * gets `--m` (0..1) by its distance to the pointer; styles.css (.glass-chip) turns that into scale
 * and a brighter "liquid glass" surface, with transitions for smoothness. Chip centres are measured
 * when the pointer enters (before anything grows), so growing chips don't move the targets.
 */
export const useMagnify = (root: RefObject<HTMLElement>, enabled: boolean) => {
  useEffect(() => {
    const host = root.current;

    if (!enabled || !host || typeof window.matchMedia !== 'function'
      || !window.matchMedia('(pointer: fine)').matches) {
      return undefined;
    }

    let centers: Center[] = [];
    let frame: number | null = null;
    let px = 0;
    let py = 0;
    let inside = false;

    const measure = () => {
      centers = Array.from(host.querySelectorAll<HTMLElement>('[data-chip]')).map(el => {
        const r = el.getBoundingClientRect();

        return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };

    const apply = () => {
      frame = null;
      centers.forEach(({ el, x, y }) => {
        const m = inside ? magnifyAt(px - x, py - y) : 0;

        el.style.setProperty('--m', m.toFixed(3));
        el.style.zIndex = m > 0.01 ? String(1 + Math.round(m * 10)) : '';
      });
    };

    const schedule = () => {
      if (frame === null) {
        frame = window.requestAnimationFrame(apply);
      }
    };

    const onEnter = (e: PointerEvent) => {
      measure();
      inside = true;
      px = e.clientX;
      py = e.clientY;
      schedule();
    };

    const onMove = (e: PointerEvent) => {
      if (!inside) {
        onEnter(e);

        return;
      }

      px = e.clientX;
      py = e.clientY;
      schedule();
    };

    const onLeave = () => {
      inside = false;
      schedule();
    };

    // Scrolling under a resting pointer moves the chips: measure again on the next move.
    const onScroll = () => {
      inside = false;
      schedule();
    };

    host.addEventListener('pointerenter', onEnter);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      host.removeEventListener('pointerenter', onEnter);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [root, enabled]);
};
