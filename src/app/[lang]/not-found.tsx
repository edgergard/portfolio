import { COLUMN } from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { T } from '@/lib/i18n-client';

/**
 * 404 inside the [lang] layout (header, footer, theme). Unknown prefix-less paths reach it via
 * the proxy's rewrite to /en/<path>; the home link follows the page language.
 */
export default function NotFound() {
  return (
    <div className={`${COLUMN} flex min-h-screen flex-col items-start justify-center py-28`}>
      <p className="mb-6 flex items-center gap-3 font-mono text-[13px] uppercase tracking-[.08em] text-ink-2">
        <b className="font-medium text-wine-2">404</b>
        <i aria-hidden className="inline-block h-px w-6 bg-rule" />
        <span><T k="not_found_label" /></span>
      </p>
      <h1 className="text-[clamp(44px,6vw,64px)] font-medium leading-none tracking-[-0.045em] text-ink">
        <T k="not_found_title" />
      </h1>
      <p className="mb-10 mt-4 max-w-[52ch] text-base text-ink-2">
        <T k="not_found_text" />
      </p>
      <Button to="/" variant="outline">
        <T k="not_found_home" />
      </Button>
    </div>
  );
}
