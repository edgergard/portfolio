import type { Metadata } from 'next';
import NotFoundView from '@/components/layout/NotFoundView';
import Button from '@/components/ui/Button';
import { SITE_ICONS, SITE_NAME } from '@/lib/metadata';
import { NOT_FOUND_LANG_SCRIPT, THEME_SCRIPT } from '@/lib/theme-script';
import { EN, UA } from '@/translations';
import '../../styles.css';

export const metadata: Metadata = {
  title: `${EN.not_found_title} — ${SITE_NAME}`,
  icons: SITE_ICONS,
  robots: { index: false },
};

const COPIES = [
  { className: 'nf-en', dict: EN, home: '/' },
  { className: 'nf-uk', dict: UA, home: '/uk' },
];

/**
 * The 404 for every unmatched URL (/de, /foo, /uk/foo, unknown CV variants). It bypasses the
 * [lang] layout, so it brings its own document, theme script and fonts, and renders both
 * languages' copy at build time.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* lang and theme are set before paint, hence suppressHydrationWarning. */}
        <script dangerouslySetInnerHTML={{ __html: NOT_FOUND_LANG_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/geist-mono-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <main className="min-h-screen bg-bg">
          {COPIES.map(({ className, dict, home }) => (
            <div key={className} className={className}>
              <NotFoundView
                label={dict.not_found_label}
                title={dict.not_found_title}
                text={dict.not_found_text}
                action={<Button href={home} variant="outline">{dict.not_found_home}</Button>}
              />
            </div>
          ))}
        </main>
      </body>
    </html>
  );
}
