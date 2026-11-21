'use client';

import Link from 'next/link';
import { useLang, useT } from '@/lib/i18n-client';
import { localeHref } from '@/lib/locale';

/** Home / Archive, with Home in the page language. A client component: its label is a string. */
const ArchiveBreadcrumb = () => {
  const t = useT();
  const lang = useLang();

  return (
    <nav aria-label={t('archive_breadcrumb_label')} className="font-mono uppercase mb-7 text-xs tracking-[.06em] text-white/75">
      <Link href={localeHref(lang, '/')} prefetch={false} className="transition-colors hover:text-ink">{t('archive_crumb_home')}</Link>
      {' / '}
      <b className="font-medium text-ink" aria-current="page">{t('archive_crumb_archive')}</b>
    </nav>
  );
};

export default ArchiveBreadcrumb;
