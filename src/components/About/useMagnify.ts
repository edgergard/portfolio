import { useEffect, type RefObject } from 'react';

/** Peak growth of the chip under the pointer (1 + GROW). */
export const GROW = 0.32;
/** How much the neighbours shrink to make room (1 - SHRINK at their deepest). */
export const SHRINK = 0.14;
/** Width (px) of the growth bump and of the wider shrink dip around the pointer. */
const UP_WIDTH = 42;
const DOWN_WIDTH = 120;
/** Vertical distance (px) from a row's centre at which the lens fades out. */
const ROW_REACH = 26;

/**
 * Scale for a chip whose centre is dx px from the pointer, at lens strength `presence` (0..1):
 * the chip under the pointer grows, its neighbours shrink a little, far chips stay at 1.
 */
export const lensScale = (dx: number, presence = 1) => {
  const up = Math.exp(-((dx / UP_WIDTH) ** 2));
  const down = Math.exp(-((dx / DOWN_WIDTH) ** 2));

  return 1 + presence * (GROW * up - SHRINK * down * (1 - up));
};

/** Glass strength 0..1 for the chip surface (only the chips right under the pointer). */
export const lensGlass = (dx: number, presence = 1) => presence * Math.exp(-((dx / UP_WIDTH) ** 2));

type Chip = { el: HTMLElement; left: number; width: number; cx: number; cy: number };

/**
 * Lays one row out around its anchor (the chip nearest the pointer, which stays put): every
 * other chip keeps its original gap to its neighbour at the new sizes, so a grown chip never
 * overlaps the shrunk ones beside it. Returns each chip's horizontal shift in px.
 */
type Span = { left: number; width: number };

export const rowShifts = (row: Span[], scales: number[], anchor: number) => {
  const centre = (i: number) => row[i].left + row[i].width / 2;
  const half = (i: number) => (row[i].width * scales[i]) / 2;
  const shifts = row.map(() => 0);
  let at = centre(anchor);

  for (let i = anchor + 1; i < row.length; i++) {
    const gap = row[i].left - (row[i - 1].left + row[i - 1].width);

    at += half(i - 1) + gap + half(i);
    shifts[i] = at - centre(i);
  }

  at = centre(anchor);

  for (let i = anchor - 1; i >= 0; i--) {
    const gap = row[i + 1].left - (row[i].left + row[i].width);

    at -= half(i + 1) + gap + half(i);
    shifts[i] = at - centre(i);
  }

  return shifts;
};

const smooth = (k: number) => {
  const c = Math.min(1, Math.max(0, k));

  return c * c * (3 - 2 * c);
};

const reset = (el: HTMLElement) => {
  el.style.setProperty('--s', '1');
  el.style.setProperty('--tx', '0px');
  el.style.setProperty('--m', '0');
  el.style.zIndex = '';
};

/**
 * A dock-like lens over chips (home Core stack). While a fine pointer moves over `root`, the row
 * of `[data-chip]`s under it reacts: the chip at the pointer grows, its neighbours shrink and move
 * aside so nothing overlaps; other rows stay still. It writes --s (scale), --tx (shift) and --m
 * (glass strength) per chip; styles.css (.glass-chip) animates them. Positions are measured on
 * entry, before anything moves, so the targets don't drift while chips change size.
 */
export const useMagnify = (root: RefObject<HTMLElement>, enabled: boolean) => {
  useEffect(() => {
    const host = root.current;

    if (!enabled || !host || typeof window.matchMedia !== 'function'
      || !window.matchMedia('(pointer: fine)').matches) {
      return undefined;
    }

    let rows: Chip[][] = [];
    let frame: number | null = null;
    let px = 0;
    let py = 0;
    let inside = false;

    const measure = () => {
      const byRow = new Map<string, Chip[]>();

      const groups = Array.from(host.querySelectorAll('dd'));

      host.querySelectorAll<HTMLElement>('[data-chip]').forEach(el => {
        const r = el.getBoundingClientRect();
        const cy = r.top + r.height / 2;
        const chip = { el, left: r.left, width: r.width, cx: r.left + r.width / 2, cy };
        // One row = one wrapped line of one group (same parent, same vertical centre).
        const key = `${groups.indexOf(el.parentElement as HTMLElement)}:${Math.round(cy)}`;

        byRow.set(key, [...(byRow.get(key) ?? []), chip]);
      });
      rows = [...byRow.values()].map(row => row.sort((a, b) => a.left - b.left));
    };

    const apply = () => {
      frame = null;
      rows.forEach(row => {
        const presence = inside ? smooth(1 - Math.abs(py - row[0].cy) / ROW_REACH) : 0;

        if (presence === 0) {
          row.forEach(c => reset(c.el));

          return;
        }

        const scales = row.map(c => lensScale(px - c.cx, presence));
        let anchor = 0;

        row.forEach((c, i) => {
          if (Math.abs(px - c.cx) < Math.abs(px - row[anchor].cx)) {
            anchor = i;
          }
        });

        const shifts = rowShifts(row, scales, anchor);

        row.forEach((c, i) => {
          const glass = lensGlass(px - c.cx, presence);

          c.el.style.setProperty('--s', scales[i].toFixed(3));
          c.el.style.setProperty('--tx', `${shifts[i].toFixed(1)}px`);
          c.el.style.setProperty('--m', glass.toFixed(3));
          c.el.style.zIndex = glass > 0.05 ? '2' : '';
        });
      });
    };

    const schedule = () => {
      if (frame === null) {
        frame = window.requestAnimationFrame(apply);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!inside) {
        measure();
        inside = true;
      }

      px = e.clientX;
      py = e.clientY;
      schedule();
    };

    const onLeave = () => {
      inside = false;
      schedule();
    };

    host.addEventListener('pointerenter', onMove);
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
    // Scrolling under a resting pointer moves the chips: settle, and measure again on the next move.
    window.addEventListener('scroll', onLeave, { passive: true });

    return () => {
      host.removeEventListener('pointerenter', onMove);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onLeave);

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [root, enabled]);
};
