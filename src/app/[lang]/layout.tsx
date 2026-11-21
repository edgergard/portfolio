import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/layout/Footer';
import MotionRoot from '@/components/layout/MotionRoot';
import PageScrollbar from '@/components/layout/PageScrollbar';
import { getDictionary } from '@/lib/dictionaries';
import { I18nProvider } from '@/lib/i18n-client';
import { isLang, LOCALES } from '@/lib/locale';
import { SITE_URL } from '@/lib/site';
import { THEME_SCRIPT } from '@/lib/theme-script';
import '../../../styles.css';

export const dynamicParams = false;

/**
 * metadataBase makes the relative canonical, hreflang and og:image URLs in page metadata
 * absolute; the icons are the OB favicon and the apple touch icon from public/.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: { url: '/favicon.svg', type: 'image/svg+xml' },
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
};

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
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Fonts are @font-face rules in styles.css; only the latin subsets are needed up front. */}
        <link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/geist-mono-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <I18nProvider lang={lang} dict={dict}>
          <MotionRoot>
            <Header />
            <main className="min-h-screen bg-bg">{children}</main>
            <Footer />
            <PageScrollbar />
          </MotionRoot>
        </I18nProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
