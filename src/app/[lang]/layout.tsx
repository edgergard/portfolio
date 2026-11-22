import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/layout/Footer';
import PageScrollbar from '@/components/layout/PageScrollbar';
import { getDictionary } from '@/lib/dictionaries';
import { I18nProvider } from '@/lib/i18n-client';
import { SITE_ICONS, SITE_VIEWPORT } from '@/lib/metadata';
import { isLang, LOCALES } from '@/lib/locale';
import { SITE_URL } from '@/lib/site';
import { THEME_COLORS, THEME_SCRIPT } from '@/lib/theme-script';
import { DEBUG_SCRIPT } from '@/lib/debug-script';
import DebugOverlay from '@/components/debug/DebugOverlay';
import '../../../styles.css';

export const dynamicParams = false;

/**
 * metadataBase makes the relative canonical, hreflang and og:image URLs in page metadata
 * absolute; the icons are the OB favicon and the apple touch icon from public/.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: SITE_ICONS,
};

export const viewport: Viewport = SITE_VIEWPORT;

export function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isLang(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);

  return (
    <html lang={lang === 'uk' ? 'uk' : 'en'} data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Theme before first paint; it may change data-theme, hence suppressHydrationWarning. */}
        {/* Before the theme script, which switches it to the light colour when needed. */}
        <meta name="theme-color" content={THEME_COLORS.dark} />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: DEBUG_SCRIPT }} />
        {/* Fonts are @font-face rules in styles.css; only the latin subsets are needed up front. */}
        <link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/geist-mono-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <I18nProvider lang={lang} dict={dict}>
          <Header />
          <main className="min-h-screen bg-bg">{children}</main>
          <Footer />
          <PageScrollbar />
        </I18nProvider>
        <SpeedInsights />
        <DebugOverlay />
      </body>
    </html>
  );
}
