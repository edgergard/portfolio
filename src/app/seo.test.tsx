import { readFileSync } from 'node:fs';
import type { FC } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { SOCIALS } from '@/data/content';
import { I18nProvider } from '@/lib/i18n-client';
import type { Lang } from '@/lib/locale';
import { SITE_URL } from '@/lib/site';
import { NOT_FOUND_LANG_SCRIPT, THEME_SCRIPT } from '@/lib/theme-script';
import { EN, UA } from '@/translations';
import css from '../../styles.css?raw';
import GlobalNotFound, { metadata as notFoundMetadata } from './global-not-found';
import { dictFor } from '@/test/renderWithI18n';
import HomePage from './[lang]/page';
import NotFound from './[lang]/not-found';
import robots from './robots';
import sitemap from './sitemap';

// global-not-found imports the stylesheet for Next; jsdom cannot parse Tailwind's output.
vi.mock('../../styles.css', () => ({}));

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

describe('global 404 (unmatched URLs)', () => {
  const html = renderToString(<GlobalNotFound />);
  const doc = new DOMParser().parseFromString(html, 'text/html');

  it('renders the English and Ukrainian copy, each with its own home link', () => {
    const en = doc.querySelector('.nf-en');
    const uk = doc.querySelector('.nf-uk');

    expect(en?.querySelector('h1')?.textContent).toBe(EN.not_found_title);
    expect(en?.querySelector('h1')?.className).toContain('tracking-[-0.045em]');
    expect(en?.querySelector('a[href="/"]')?.textContent).toBe(EN.not_found_home);
    expect(uk?.querySelector('h1')?.textContent).toBe(UA.not_found_title);
    expect(uk?.querySelector('a[href="/uk"]')?.textContent).toBe(UA.not_found_home);
  });

  it('sets the language and theme before paint, in its own document', () => {
    expect(html).toMatch(/^<html lang="en" data-theme="dark">/);
    expect(html).toContain(NOT_FOUND_LANG_SCRIPT);
    expect(html).toContain(THEME_SCRIPT);
    expect(html.indexOf(NOT_FOUND_LANG_SCRIPT)).toBeLessThan(html.indexOf('<body'));
  });

  it.each([['/uk', 'uk'], ['/uk/foo', 'uk'], ['/ukraine', 'en'], ['/foo', 'en'], ['/de', 'en']])(
    'picks the language from the path (%s -> %s)',
    (pathname, lang) => {
      const root = { lang: '' };

      new Function('document', 'location', NOT_FOUND_LANG_SCRIPT)({ documentElement: root }, { pathname });
      expect(root.lang).toBe(lang);
    },
  );

  it('is titled and kept out of the index', () => {
    expect(notFoundMetadata.title).toBe('Page not found — Oleksandr Bryksin');
    expect(notFoundMetadata.robots).toEqual({ index: false });
  });

  it.each([['en', 'nf-uk'], ['uk', 'nf-en']])('hides the inactive copy (lang=%s hides .%s)', (lang, hidden) => {
    const rules = css.match(/html\[lang='uk'\] \.nf-en,[^}]*\}/)?.[0];

    expect(rules).toBeDefined();
    document.head.innerHTML = `<style>${rules}</style>`;
    document.documentElement.lang = lang;
    document.body.innerHTML = '<div class="nf-en"></div><div class="nf-uk"></div>';

    const shown = hidden === 'nf-en' ? 'nf-uk' : 'nf-en';

    expect(getComputedStyle(document.querySelector(`.${hidden}`)!).display).toBe('none');
    expect(getComputedStyle(document.querySelector(`.${shown}`)!).display).not.toBe('none');
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    document.documentElement.lang = '';
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
