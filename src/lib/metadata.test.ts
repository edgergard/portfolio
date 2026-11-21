import { describe, expect, it } from 'vitest';
import { EN, UA } from '@/translations';
import { HOME_DESCRIPTION, HOME_TITLE, pageMetadata } from './metadata';

type OgImage = { url: string; width: number; height: number; alt: string };

describe('pageMetadata', () => {
  it('points canonical and hreflang alternates at the locale URLs', () => {
    const { alternates } = pageMetadata('uk', 'projects', UA);

    expect(alternates?.canonical).toBe('/uk/projects');
    expect(alternates?.languages).toEqual({ 'en': '/projects', 'uk': '/uk/projects', 'x-default': '/projects' });
  });

  it('uses the site root and /uk for the home page', () => {
    expect(pageMetadata('en', 'home', EN).alternates).toEqual({
      canonical: '/',
      languages: { 'en': '/', 'uk': '/uk', 'x-default': '/' },
    });
    expect(pageMetadata('uk', 'home', UA).alternates?.canonical).toBe('/uk');
  });

  it('keeps today\'s title and description on the home page', () => {
    const meta = pageMetadata('en', 'home', EN);

    expect(meta.title).toBe('Oleksandr Bryksin — React Native & Frontend Developer');
    expect(meta.title).toBe(HOME_TITLE);
    expect(meta.description).toBe(HOME_DESCRIPTION);
    expect(meta.description).toMatch(/^Oleksandr Bryksin, React Native & frontend developer in Kyiv\./);
  });

  it('takes the archive and CV titles from the dictionary', () => {
    expect(pageMetadata('en', 'projects', EN).title).toBe(EN.meta_projects_title);
    expect(pageMetadata('uk', 'projects', UA).description).toBe(UA.meta_projects_description);

    const cv = pageMetadata('uk', { cv: 'frontend' }, UA);

    expect(cv.alternates?.canonical).toBe('/uk/cv/frontend');
    expect(cv.title).toContain('Frontend');
    expect(pageMetadata('en', { cv: 'react-native' }, EN).title).toContain('React Native');
  });

  it('describes the page for link previews', () => {
    const { openGraph, twitter } = pageMetadata('uk', 'projects', UA);
    const og = openGraph as {
      url: string;
      siteName: string;
      locale: string;
      type: string;
      images: OgImage[];
    };

    expect(og.url).toBe('/uk/projects');
    expect(og.siteName).toBe('Oleksandr Bryksin');
    expect(og.locale).toBe('uk_UA');
    expect(og.type).toBe('website');
    expect(og.images[0]).toMatchObject({ url: '/og-image.jpg', width: 1200, height: 630 });
    expect(og.images[0].alt).toMatch(/Oleksandr Bryksin/);
    expect((pageMetadata('en', 'home', EN).openGraph as { locale: string }).locale).toBe('en_US');
    expect((twitter as { card: string }).card).toBe('summary_large_image');
  });

  it('has the meta keys in both dictionaries', () => {
    for (const key of ['meta_projects_title', 'meta_projects_description', 'meta_cv_title', 'meta_cv_description']) {
      expect(EN).toHaveProperty(key);
      expect(UA).toHaveProperty(key);
    }
  });
});
