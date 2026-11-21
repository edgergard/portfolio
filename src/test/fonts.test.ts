import { describe, expect, it } from 'vitest';
import html from '../../index.html?raw';
import css from '../../styles.css?raw';

describe('self-hosted fonts', () => {
  it('no longer asks Google Fonts for the stylesheet', () => {
    expect(html).not.toContain('fonts.googleapis.com');
  });

  it('preloads the latin Geist file used by the first screen', () => {
    expect(html).toMatch(
      /<link rel="preload" href="[^"]*fonts\/geist-latin\.woff2" as="font" type="font\/woff2" crossorigin/,
    );
  });

  it('declares Geist and Geist Mono with font-display swap', () => {
    const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];

    expect(faces.some(f => /font-family: 'Geist';/.test(f) && /font-display: swap/.test(f))).toBe(true);
    expect(faces.some(f => /font-family: 'Geist Mono';/.test(f) && /font-display: swap/.test(f))).toBe(true);
  });
});
