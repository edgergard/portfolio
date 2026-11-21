import { readFileSync } from 'node:fs';
import type { FC } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SOCIALS } from '@/data/content';
import { I18nProvider } from '@/lib/i18n-client';
import type { Lang } from '@/lib/locale';
import { SITE_URL } from '@/lib/site';
import { dictFor } from '@/test/renderWithI18n';
import HomePage from './[lang]/page';
import NotFound from './[lang]/not-found';
import robots from './robots';
import sitemap from './sitemap';

/** Server-renders a page the way the static HTML gets it (no effects run). */
const prerender = (lang: Lang, Page: FC) =>
  new DOMParser().parseFromString(
    renderToString(
      <I18nProvider lang={lang} dict={dictFor(lang)}>
        <Page />
      </I18nProvider>,
    ),
    'text/html',
  );

describe('sitemap', () => {
  const entries = sitemap();

  it('lists every page in both locales, with hreflang alternates', () => {
    expect(entries.map(e => e.url).sort()).toEqual([
      SITE_URL,
      `${SITE_URL}/cv/frontend`,
      `${SITE_URL}/cv/react-native`,
      `${SITE_URL}/projects`,
      `${SITE_URL}/uk`,
      `${SITE_URL}/uk/cv/frontend`,
      `${SITE_URL}/uk/cv/react-native`,
      `${SITE_URL}/uk/projects`,
    ].sort());

    for (const entry of entries) {
      expect(entry.alternates?.languages).toHaveProperty('en');
      expect(entry.alternates?.languages).toHaveProperty('uk');
    }
  });

  it('leaves out the /cv redirects', () => {
    expect(entries.some(e => /\/cv$/.test(e.url))).toBe(false);
  });
});

describe('robots', () => {
  it('allows everything and points at the sitemap', () => {
    const r = robots();

    expect(r.rules).toMatchObject({ allow: '/' });
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});

describe('home page JSON-LD', () => {
  it('describes the owner as a Person', () => {
    const script = prerender('en', HomePage).querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script?.textContent ?? '{}');
    const href = (id: string) => SOCIALS.find(s => s.id === id)?.href;

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('Person');
    expect(data.name).toBe('Oleksandr Bryksin');
    expect(data.jobTitle).toMatch(/React Native/);
    expect(data.sameAs).toEqual(expect.arrayContaining([href('github'), href('linkedin')]));
  });
});

describe('not-found page', () => {
  it.each([['en', '/'], ['uk', '/uk']] as const)('shows the site heading and a link home (%s)', (lang, home) => {
    const doc = prerender(lang, NotFound);
    const h1 = doc.querySelector('h1');

    expect(h1?.textContent).toBe(dictFor(lang).not_found_title);
    expect(h1?.className).toContain('tracking-[-0.045em]');
    expect(doc.querySelector(`a[href="${home}"]`)?.textContent).toBe(dictFor(lang).not_found_home);
  });
});

describe('link preview image', () => {
  it('is a 1200×630 JPEG under 600 KB', () => {
    const jpg = readFileSync('public/og-image.jpg');

    // JPEG SOF0/SOF2 frame header carries height then width.
    const sof = jpg.findIndex((b, i) => b === 0xff && (jpg[i + 1] === 0xc0 || jpg[i + 1] === 0xc2));

    expect(jpg.readUInt16BE(sof + 5)).toBe(630);
    expect(jpg.readUInt16BE(sof + 7)).toBe(1200);
    expect(jpg.length).toBeLessThan(600 * 1024);
  });
});
