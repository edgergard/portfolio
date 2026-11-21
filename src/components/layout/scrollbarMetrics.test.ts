import { describe, expect, it } from 'vitest';
import { dragScrollTop, thumbMetrics } from './scrollbarMetrics';

const page = (scrollTop: number, scrollHeight = 4000, clientHeight = 1000) =>
  ({ scrollTop, scrollHeight, clientHeight });

describe('thumbMetrics', () => {
  it('sizes the thumb to the visible share of the page', () => {
    const m = thumbMetrics(page(0), 800);

    expect(m).toEqual({ size: 200, offset: 0, scrollable: true });
  });

  it('places the thumb proportionally to the scroll position', () => {
    // Travel = 800 - 200 = 600; half of max scroll (1500 of 3000) puts it at 300.
    expect(thumbMetrics(page(1500), 800).offset).toBe(300);
    expect(thumbMetrics(page(3000), 800).offset).toBe(600);
  });

  it('never shrinks the thumb below the minimum height', () => {
    const m = thumbMetrics(page(99000, 100000), 800);

    expect(m.size).toBe(40);
    expect(m.offset).toBe(760);
  });

  it('clamps overscroll (negative or past the end) to the rail', () => {
    expect(thumbMetrics(page(-50), 800).offset).toBe(0);
    expect(thumbMetrics(page(5000), 800).offset).toBe(600);
  });

  it('reports a page that does not scroll', () => {
    expect(thumbMetrics(page(0, 900, 900), 800).scrollable).toBe(false);
    expect(thumbMetrics(page(0), 0).scrollable).toBe(false);
  });
});

describe('dragScrollTop', () => {
  const dims = { scrollTop: 0, scrollHeight: 4000, clientHeight: 1000 };

  it('maps thumb travel to page scroll', () => {
    // 600px of thumb travel covers 3000px of scroll: 5px of page per px of drag.
    expect(dragScrollTop(dims, 800, 0, 60)).toBe(300);
    expect(dragScrollTop(dims, 800, 1000, -100)).toBe(500);
  });

  it('clamps to the scroll range', () => {
    expect(dragScrollTop(dims, 800, 0, -40)).toBe(0);
    expect(dragScrollTop(dims, 800, 2900, 400)).toBe(3000);
  });
});
