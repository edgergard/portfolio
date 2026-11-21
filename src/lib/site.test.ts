import { describe, expect, it } from 'vitest';
import { normalizeSiteUrl } from './site';

describe('normalizeSiteUrl', () => {
  it('falls back when unset or empty', () => {
    expect(normalizeSiteUrl(undefined)).toBe('https://oleksandr-bryksin.vercel.app');
    expect(normalizeSiteUrl('')).toBe('https://oleksandr-bryksin.vercel.app');
    expect(normalizeSiteUrl('  ')).toBe('https://oleksandr-bryksin.vercel.app');
  });

  it('strips trailing slashes and paths', () => {
    expect(normalizeSiteUrl('https://x.vercel.app/')).toBe('https://x.vercel.app');
    expect(normalizeSiteUrl('https://x.vercel.app///')).toBe('https://x.vercel.app');
  });

  it('fails clearly on an invalid value', () => {
    expect(() => normalizeSiteUrl('https://<project>.vercel.app')).toThrow(/NEXT_PUBLIC_SITE_URL/);
    expect(() => normalizeSiteUrl('not a url')).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});
