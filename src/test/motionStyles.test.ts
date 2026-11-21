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

describe('page scrollbar thumb', () => {
  it('sits on a wine base, never the dark shader colours', () => {
    const thumb = block('.wine-thumb');
    const fill = block('.wine-thumb::before') + block('.wine-thumb::after');

    expect(thumb).toMatch(/background(-color)?:\s*#8B1426/i);
    expect(fill + thumb).not.toMatch(/#0A0A0B|#3E0712|rgba\(\s*(10|30|62),/i);
    expect(fill).toMatch(/#FF4D63/i);
  });

  it('keeps drifting (slower under reduced motion) without rotating the blobs away', () => {
    expect(durations(block('.wine-thumb::before')).length).toBeGreaterThanOrEqual(1);
    expect(durations(block('.wine-thumb::after')).length).toBeGreaterThanOrEqual(1);
    expect(css).not.toMatch(/@keyframes wine-thumb[\w-]*\s*{[^@]*rotate/);
  });

  it('hides the native page scrollbar for fine pointers only', () => {
    expect(css).toMatch(/@media \(pointer: fine\)\s*{\s*html\s*{\s*scrollbar-width:\s*none;?\s*}\s*html::-webkit-scrollbar\s*{\s*display:\s*none;?\s*}/);
  });
});

/** Source text of a component, for checking its module directives and imports. */
const sources = import.meta.glob(
  [
    '../components/layout/{Reveal,Section}.tsx',
    '../components/ui/{Button,WineBadge,WineCanvas,ChunkBoundary}.tsx',
    '../components/Wine/{WineSurface,WineCanvas}.tsx',
  ],
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

const source = (path: string) => {
  const text = sources[`../components/${path}`];

  if (text === undefined) {
    throw new Error(`no source for ${path}`);
  }

  return text;
};

const isClient = (text: string) => /^\s*['"]use client['"];?/.test(text);

describe('client islands', () => {
  it('reveals with motion/react, not framer-motion', () => {
    expect(source('layout/Reveal.tsx')).toMatch(/from 'motion\/react'/);
    expect(source('layout/Reveal.tsx')).not.toMatch(/framer-motion/);
  });

  it('keeps Section and WineBadge as Server Components', () => {
    expect(source('layout/Section.tsx')).not.toMatch(/['"]use client['"]/);
    expect(source('ui/WineBadge.tsx')).not.toMatch(/['"]use client['"]/);
  });

  it('marks the components with hooks, state or browser APIs as client', () => {
    for (const path of [
      'layout/Reveal.tsx',
      'ui/Button.tsx',
      'ui/WineCanvas.tsx',
      'ui/ChunkBoundary.tsx',
      'Wine/WineSurface.tsx',
      'Wine/WineCanvas.tsx',
    ]) {
      expect(isClient(source(path)), path).toBe(true);
    }
  });
});
