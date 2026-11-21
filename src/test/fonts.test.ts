import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const layout = readFileSync(resolve(__dirname, '../app/[lang]/layout.tsx'), 'utf8');
const css = readFileSync(resolve(__dirname, '../../styles.css'), 'utf8');
const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];

const face = (family: string, file: string) =>
  faces.find(f => f.includes(`font-family: '${family}';`) && f.includes(`url('/fonts/${file}.woff2')`)) ?? '';

describe('self-hosted fonts', () => {
  it.each([
    ['Geist', 'geist', '300 700'],
    ['Geist Mono', 'geist-mono', '400 500'],
  ])('declares %s for each subset with unicode-range and swap', (family, prefix, weight) => {
    for (const subset of ['cyrillic', 'latin-ext', 'latin']) {
      const f = face(family, `${prefix}-${subset}`);

      expect(f, `${prefix}-${subset}`).toMatch(/unicode-range: U\+/);
      expect(f).toContain('font-display: swap;');
      expect(f).toContain(`font-weight: ${weight};`);
    }
  });

  it('exposes the families as the CSS variables Tailwind reads', () => {
    expect(css).toContain("--font-geist: 'Geist';");
    expect(css).toContain("--font-geist-mono: 'Geist Mono';");
  });

  it('preloads exactly the two latin files', () => {
    const preloads = [...layout.matchAll(/<link\s+rel="preload"\s+href="([^"]+)"\s+as="font"\s+type="font\/woff2"\s+crossOrigin=""/g)]
      .map(m => m[1]);

    expect(preloads).toEqual(['/fonts/geist-latin.woff2', '/fonts/geist-mono-latin.woff2']);
    expect(layout.match(/rel="preload"/g)).toHaveLength(2);
  });

  it('does not use next/font', () => {
    expect(layout).not.toContain('next/font');
  });
});
