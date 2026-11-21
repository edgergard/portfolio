import { SpeedInsights } from '@vercel/speed-insights/next';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { isLang, LOCALES } from '@/lib/locale';
import { THEME_SCRIPT } from '@/lib/theme-script';
import '../../../styles.css';

const geist = localFont({
  src: [
    { path: '../../../public/fonts/geist-latin.woff2' },
    { path: '../../../public/fonts/geist-latin-ext.woff2' },
    { path: '../../../public/fonts/geist-cyrillic.woff2' },
  ],
  weight: '300 700',
  display: 'swap',
  variable: '--font-geist',
});

const geistMono = localFont({
  src: [
    { path: '../../../public/fonts/geist-mono-latin.woff2' },
    { path: '../../../public/fonts/geist-mono-latin-ext.woff2' },
    { path: '../../../public/fonts/geist-mono-cyrillic.woff2' },
  ],
  weight: '400 500',
  display: 'swap',
  variable: '--font-geist-mono',
});

export const dynamicParams = false;

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

  return (
    <html
      lang={lang === 'uk' ? 'uk' : 'en'}
      data-theme="dark"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <head>
        {/* Theme before first paint; it may change data-theme, hence suppressHydrationWarning. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
