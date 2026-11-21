import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const layoutPath = resolve(__dirname, '../app/[lang]/layout.tsx');
const layout = readFileSync(layoutPath, 'utf8');
const css = readFileSync(resolve(__dirname, '../../styles.css'), 'utf8');

/** The `localFont({...})` call that loads the given file, as source text. */
const fontCall = (file: string) => {
  const calls = layout.match(/localFont\(\{[\s\S]*?\n\}\)/g) ?? [];

  return calls.find(c => c.includes(file)) ?? '';
};

describe('self-hosted fonts via next/font', () => {
  it('loads the fonts with next/font/local', () => {
    expect(layout).toContain("from 'next/font/local'");
  });

  it('loads Geist (latin first, then latin-ext and cyrillic) at weights 300-700 with swap', () => {
    const geist = fontCall('geist-latin.woff2');

    expect(geist).toMatch(/path: '\.\.\/\.\.\/\.\.\/public\/fonts\/geist-latin\.woff2'/);
    expect(geist).toContain('geist-latin-ext.woff2');
    expect(geist).toContain('geist-cyrillic.woff2');
    expect(geist).toContain("weight: '300 700'");
    expect(geist).toContain("display: 'swap'");
    expect(geist).toContain("variable: '--font-geist'");
  });

  it('loads Geist Mono at weights 400-500 with swap', () => {
    const mono = fontCall('geist-mono-latin.woff2');

    expect(mono).toContain('geist-mono-latin-ext.woff2');
    expect(mono).toContain('geist-mono-cyrillic.woff2');
    expect(mono).toContain("weight: '400 500'");
    expect(mono).toContain("display: 'swap'");
    expect(mono).toContain("variable: '--font-geist-mono'");
  });

  it('points at font files that exist', () => {
    const paths = [...layout.matchAll(/path: '([^']+\.woff2)'/g)].map(m => m[1]);

    expect(paths).toHaveLength(6);
    for (const p of paths) {
      expect(existsSync(resolve(dirname(layoutPath), p))).toBe(true);
    }
  });

  it('no longer declares @font-face in styles.css', () => {
    expect(css).not.toMatch(/@font-face/);
  });
});
