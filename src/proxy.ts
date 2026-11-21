import { NextResponse, type NextRequest } from 'next/server';
import { LANG_COOKIE, resolveLocale } from '@/lib/locale';

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const { action, url } = resolveLocale(pathname, req.cookies.get(LANG_COOKIE)?.value);

  if (action === 'next') return NextResponse.next();

  const target = req.nextUrl.clone();
  target.pathname = url;
  target.search = search;
  return action === 'rewrite' ? NextResponse.rewrite(target) : NextResponse.redirect(target);
}

export const config = {
  // Skip Next internals, API routes, static files and anything with a file extension.
  matcher: [
    '/((?!_next|api|favicon\.svg|apple-touch-icon\.png|og-image\.jpg|robots\.txt|sitemap\.xml|fonts/|videos/|cv/.*\.pdf|.*\..*).*)',
  ],
};
