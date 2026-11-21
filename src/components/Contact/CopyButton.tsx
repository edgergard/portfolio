'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n-client';

type Props = {
  /** The text put on the clipboard. */
  value: string;
  /** Translation key for the accessible name, e.g. "Copy email address". */
  labelKey: string;
};

const COPIED_MS = 1800;

/**
 * A text button that copies `value` with the Clipboard API, then reads "Copied" for a moment.
 * A polite live region announces the result for screen readers.
 */
const CopyButton = ({ value, labelKey }: Props) => {
  const t = useT();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const id = window.setTimeout(() => setCopied(false), COPIED_MS);

    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard blocked or unavailable: leave the button as it was.
    }
  };

  const state = copied
    ? 'border-white bg-white/10 text-white'
    : 'border-white/25 text-white/90 hover:border-white hover:text-white group-hover:border-white/60';

  return (
    <>
      <button
        type="button"
        aria-label={t(labelKey)}
        onClick={copy}
        data-copied={copied}
        className={
          'inline-flex h-9 shrink-0 items-center rounded-full border px-3 sm:px-3.5 font-mono text-[13px] tracking-[.02em] '
          + 'transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 '
          + `focus-visible:outline-white ${state}`
        }
      >
        {copied ? t('contact_copied') : t('contact_copy')}
      </button>
      <span role="status" className="sr-only">
        {copied ? t('contact_copied_announce') : ''}
      </span>
    </>
  );
};

export default CopyButton;
