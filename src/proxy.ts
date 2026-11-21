import { NextResponse, type NextRequest } from 'next/server';
import { LANG_COOKIE, resolveLocale } from '@/lib/locale';

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const { action, url, persist } = resolveLocale(pathname, req.cookies.get(LANG_COOKIE)?.value);

  if (action === 'next') {
    return NextResponse.next();
  }

  const target = req.nextUrl.clone();

  target.pathname = url;
  target.search = search;

  if (action === 'rewrite') {
    return NextResponse.rewrite(target);
  }

  const res = NextResponse.redirect(target);

  if (persist) {
    res.cookies.set(LANG_COOKIE, persist, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  }

  return res;
}

export const config = {
  // Skip Next and Vercel internals (Speed Insights beacons), API routes, static files and anything with a file extension.
  matcher: [
    '/((?!_next|_vercel|api/|fonts/|videos/|.*\\..*).*)',
  ],
};
