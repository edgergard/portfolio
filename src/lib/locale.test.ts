import { describe, expect, it } from 'vitest';
import { localeHref, resolveLocale, switchLocaleHref } from './locale';

describe('resolveLocale', () => {
  it('rewrites a prefix-less path to English when there is no cookie', () => {
    expect(resolveLocale('/projects', undefined)).toEqual({ action: 'rewrite', url: '/en/projects' });
    expect(resolveLocale('/', undefined)).toEqual({ action: 'rewrite', url: '/en' });
  });

  it('redirects a prefix-less path to /uk when the cookie is uk', () => {
    expect(resolveLocale('/projects', 'uk')).toEqual({ action: 'redirect', url: '/uk/projects' });
    expect(resolveLocale('/', 'uk')).toEqual({ action: 'redirect', url: '/uk' });
  });

  it('lets an explicit /uk prefix win over the cookie', () => {
    expect(resolveLocale('/uk/cv/frontend', 'en')).toEqual({ action: 'next', url: '/uk/cv/frontend' });
    expect(resolveLocale('/uk', 'en')).toEqual({ action: 'next', url: '/uk' });
  });

  it('redirects an explicit /en prefix to the prefix-less URL', () => {
    expect(resolveLocale('/en/projects', undefined)).toEqual({ action: 'redirect', url: '/projects' });
    expect(resolveLocale('/en', 'uk')).toEqual({ action: 'redirect', url: '/' });
  });

  it('does not mistake paths that merely start with uk or en for locales', () => {
    expect(resolveLocale('/ukulele', undefined)).toEqual({ action: 'rewrite', url: '/en/ukulele' });
  });
});

describe('localeHref', () => {
  it('leaves English paths unprefixed and prefixes uk', () => {
    expect(localeHref('en', '/cv/frontend')).toBe('/cv/frontend');
    expect(localeHref('en', '/')).toBe('/');
    expect(localeHref('uk', '/')).toBe('/uk');
    expect(localeHref('uk', '/projects')).toBe('/uk/projects');
  });
});

describe('switchLocaleHref', () => {
  it('adds the uk prefix and keeps search and hash', () => {
    expect(switchLocaleHref('uk', '/cv/frontend', '?view=pdf', '#top')).toBe('/uk/cv/frontend?view=pdf#top');
  });

  it('strips the uk prefix when switching to English', () => {
    expect(switchLocaleHref('en', '/uk', '', '#contact')).toBe('/#contact');
    expect(switchLocaleHref('en', '/uk/projects', '', '')).toBe('/projects');
  });
});
