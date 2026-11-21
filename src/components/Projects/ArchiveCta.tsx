'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLang, useT } from '@/lib/i18n-client';
import { localeHref } from '@/lib/locale';
import { PROJECT_LIST } from '../../data/projects';
import { GLASS } from '../layout/Section';
import WineCanvas from '../ui/WineCanvas';

const years = PROJECT_LIST.map(p => p.year);
const FROM = Math.min(...years);
const TO = Math.max(...years);

/** Up to three posters of projects that are not on the home page (the archive's extra content). */
const previews = () => {
  const rest = PROJECT_LIST.filter(p => !p.featured);

  return (rest.length ? rest : PROJECT_LIST).slice(0, 3);
};

/**
 * The link to the archive, as one more glass card under the featured rows: a mono kicker with
 * the year range, a large "See all N projects", a stack of other projects' posters and an arrow
 * disc on the live wine that nudges right on hover. A client component: its aria-label is a
 * translated string and the link follows the page language.
 */
const ArchiveCta = () => {
  const t = useT();
  const lang = useLang();
  const count = PROJECT_LIST.length;

  return (
    <Link
      href={localeHref(lang, '/projects')}
      prefetch={false}
      aria-label={t('projects_archive_link', { count })}
      data-testid="archive-cta"
      className={
        `${GLASS} group flex w-full items-center gap-5 py-5 pl-6 pr-5 text-white transition-colors duration-200 `
        + 'hover:border-wine-3/80 hover:bg-[rgba(10,10,11,0.65)] focus-visible:outline focus-visible:outline-2 '
        + 'focus-visible:outline-offset-4 focus-visible:outline-white min-[900px]:gap-6 min-[900px]:pl-8'
      }
    >
      <span className="grid min-w-0 gap-1">
        <span className="font-mono text-xs uppercase tracking-[.07em] text-white/60">
          {t('projects_archive_kicker', { from: FROM, to: TO })}
        </span>
        <span className="text-[22px] font-medium leading-tight tracking-[-.02em] min-[900px]:text-[26px]">
          {t('projects_archive_title', { count })}
        </span>
      </span>
      <span aria-hidden className="ml-auto hidden pl-3.5 min-[640px]:flex">
        {previews().map(p => (
          <Image
            key={p.id}
            src={p.poster}
            alt=""
            width={64}
            height={40}
            loading="lazy"
            className="-ml-3.5 h-10 w-16 rounded-lg border-2 border-[#1a0a0e] object-cover object-top"
          />
        ))}
      </span>
      <span
        aria-hidden
        data-testid="archive-cta-arrow"
        className={
          'bg-wine-flow ml-auto grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border border-white/25 '
          + 'text-xl text-white shadow-[0_8px_28px_-10px_rgba(184,35,63,.7)] transition-transform duration-200 '
          + 'group-hover:translate-x-[3px] min-[640px]:ml-0'
        }
      >
        <WineCanvas />
        →
      </span>
    </Link>
  );
};

export default ArchiveCta;
