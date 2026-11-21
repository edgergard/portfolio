import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import html from '../../index.html?raw';

const SITE = 'https://edgergard.github.io/portfolio/';
const meta = (attr: 'property' | 'name', key: string) =>
  html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1];

describe('link preview (Open Graph / Twitter)', () => {
  it('describes the page for link previews', () => {
    expect(meta('property', 'og:type')).toBe('website');
    expect(meta('property', 'og:url')).toBe(SITE);
    expect(meta('property', 'og:title')).toBe('Oleksandr Bryksin — React Native &amp; Frontend Developer');
    expect(meta('property', 'og:description')).toMatch(/React Native/);
    expect(meta('name', 'twitter:card')).toBe('summary_large_image');
    expect(html).toContain(`<link rel="canonical" href="${SITE}"`);
  });

  it('points at an absolute 1200×630 preview image that exists', () => {
    expect(meta('property', 'og:image')).toBe(`${SITE}og-image.jpg`);
    expect(meta('name', 'twitter:image')).toBe(`${SITE}og-image.jpg`);
    expect(meta('property', 'og:image:width')).toBe('1200');
    expect(meta('property', 'og:image:height')).toBe('630');
    expect(meta('property', 'og:image:alt')).toMatch(/Oleksandr Bryksin/);

    const jpg = readFileSync('public/og-image.jpg');

    // JPEG SOF0/SOF2 frame header carries height then width.
    const sof = jpg.findIndex((b, i) => b === 0xff && (jpg[i + 1] === 0xc0 || jpg[i + 1] === 0xc2));

    expect(jpg.readUInt16BE(sof + 5)).toBe(630);
    expect(jpg.readUInt16BE(sof + 7)).toBe(1200);
    expect(jpg.length).toBeLessThan(600 * 1024);
  });
});
