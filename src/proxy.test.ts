import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import proxySource from './proxy.ts?raw';
import { proxy } from './proxy';

// Next statically analyses `config`, so the matcher stays an inline literal in proxy.ts. Read
// it back from the source and unescape the string literal the way JS would.
function readMatcher(): string {
  const literal = /matcher:\s*\[\s*'((?:[^'\\]|\\.)*)'/.exec(proxySource)?.[1];

  if (!literal) {
    throw new Error('matcher literal not found in proxy.ts');
  }

  return literal.replace(/\\(.)/g, '$1');
}

describe('proxy matcher', () => {
  const re = new RegExp(`^${readMatcher()}$`);

  it.each(['/', '/uk', '/uk/projects', '/projects', '/cv/frontend', '/en/projects', '/apiary'])(
    'runs on %s',
    (path) => expect(re.test(path)).toBe(true),
  );

  it.each([
    '/_next/static/x.js',
    '/_vercel/speed-insights/vitals',
    '/_vercel/insights/view',
    '/api/x',
    '/fonts/geist-latin.woff2',
    '/videos/pokemon.mp4',
    '/cv/oleksandr-bryksin-frontend-cv.pdf',
    '/og-image.jpg',
    '/sitemap.xml',
    '/robots.txt',
    '/favicon.svg',
  ])('skips %s', (path) => expect(re.test(path)).toBe(false));
});

describe('proxy()', () => {
  const req = (url: string, cookie?: string) =>
    new NextRequest(`http://localhost${url}`, cookie ? { headers: { cookie } } : undefined);

  it('rewrites prefix-less paths to /en and keeps the query', () => {
    const res = proxy(req('/projects?a=1'));

    expect(res.headers.get('x-middleware-rewrite')).toBe('http://localhost/en/projects?a=1');
  });

  it('redirects to /uk when the cookie says uk, keeping the query', () => {
    const res = proxy(req('/cv/frontend?view=pdf', 'lang=uk'));

    expect(res.headers.get('location')).toBe('http://localhost/uk/cv/frontend?view=pdf');
  });

  it('persists English when redirecting /en/... (the no-JS language switch)', () => {
    const res = proxy(req('/en/projects?a=1', 'lang=uk'));

    expect(res.headers.get('location')).toBe('http://localhost/projects?a=1');
    const cookie = res.headers.get('set-cookie') ?? '';

    expect(cookie).toContain('lang=en');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('Max-Age=31536000');
    expect(cookie).toMatch(/SameSite=lax/i);
  });

  it('does not set the cookie on other responses', () => {
    expect(proxy(req('/uk/projects')).headers.get('set-cookie')).toBeNull();
    expect(proxy(req('/projects', 'lang=uk')).headers.get('set-cookie')).toBeNull();
    expect(proxy(req('/projects')).headers.get('set-cookie')).toBeNull();
  });

  it('passes /uk paths through', () => {
    const res = proxy(req('/uk/projects'));

    expect(res.headers.get('x-middleware-next')).toBe('1');
  });
});
