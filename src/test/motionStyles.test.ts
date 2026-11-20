import { describe, expect, it } from 'vitest';
import css from '../../styles.css?raw';

/** Seconds of every `calc(<n>s * var(--wine-slow))` duration in a CSS block. */
const durations = (block: string) =>
  [...block.matchAll(/calc\(\s*([\d.]+)s\s*\*\s*var\(--wine-slow\)\s*\)/g)].map(m => Number(m[1]));

const block = (selector: string) => {
  // The last rule for the selector is its own block (earlier hits are shared selector lists).
  const start = css.lastIndexOf(`${selector} {`);

  return css.slice(start, css.indexOf('}', start));
};

describe('wine motion styles', () => {
  it('drifts the wine-flow blobs on several staggered 8–14s loops', () => {
    const loops = [...durations(block('.bg-wine-flow::before')), ...durations(block('.bg-wine-flow::after'))];

    expect(loops.length).toBeGreaterThanOrEqual(4);
    expect(new Set(loops).size).toBe(loops.length);
    for (const s of loops) {
      expect(s).toBeGreaterThanOrEqual(8);
      expect(s).toBeLessThanOrEqual(14);
    }
  });

  it('animates translate and scale, not just a slow rotation', () => {
    const keyframes = css.match(/@keyframes wine-[\w-]+\s*{[^@]*?}\s*}/g)?.join('\n') ?? '';

    expect(keyframes).toMatch(/translate:/);
    expect(keyframes).toMatch(/scale:/);
  });

  it('keeps the Contact frame drifting on a short loop', () => {
    const loops = durations(block('.wine-edge'));

    expect(loops).toHaveLength(1);
    expect(loops[0]).toBeLessThanOrEqual(8);
  });

  it('slows reduced motion by at most 1.5x and never freezes it', () => {
    const base = css.match(/:root\s*{[^}]*--wine-slow:\s*([\d.]+)/);
    const reduced = css.match(/prefers-reduced-motion:\s*reduce\)\s*{\s*:root\s*{\s*--wine-slow:\s*([\d.]+)/);

    expect(Number(base?.[1])).toBe(1);
    expect(Number(reduced?.[1])).toBeGreaterThan(1);
    expect(Number(reduced?.[1])).toBeLessThanOrEqual(1.5);
    expect(css).not.toMatch(/animation(-duration)?:\s*(none|[2-9]\d+s|\d{3,}s)/);
    expect(css).not.toMatch(/animation-play-state:\s*paused/);
  });
});
