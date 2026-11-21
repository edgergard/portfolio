'use client';

import Link from 'next/link';
import { useLang, useT } from '@/lib/i18n-client';
import { localeHref } from '@/lib/locale';
import { ArrowDownIcon, ArrowUpRightIcon, DocumentIcon } from './icons';
import { CIRCLE, FOCUS, ROW, Tile } from './rows';

// Public files: the same URL in every locale.
const CV_BASE = '/cv/';

const CVS = [
  { key: 'contact_cv_rn', shortKey: 'contact_cv_rn_short', file: 'oleksandr-bryksin-react-native-cv.pdf' },
  { key: 'contact_cv_fe', shortKey: 'contact_cv_fe_short', file: 'oleksandr-bryksin-frontend-cv.pdf' },
];

/**
 * The CV row: both PDF downloads and the arrow to the CV page. A client component: its
 * aria-labels are translated strings and the page link follows the locale.
 */
const CvRow = () => {
  const t = useT();
  const lang = useLang();

  return (
    // Not one link (two downloads and the page link), so no row-wide hover on the arrow.
    <li className={ROW.replace('group ', '')}>
      <Tile><DocumentIcon /></Tile>
      <span className="grid min-w-0 flex-1 gap-1.5">
        <span className="text-[17px] leading-snug text-white">{t('contact_cv_name')}</span>
        <span className="flex flex-wrap gap-2">
          {CVS.map(cv => (
            <a
              key={cv.key}
              href={CV_BASE + cv.file}
              download
              aria-label={`${t(cv.key)}, ${t('contact_cv_pdf')}`}
              className={
                'inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1 font-mono '
                + `text-[13px] text-white/90 transition-colors hover:border-white hover:bg-white/10 hover:text-white ${FOCUS}`
              }
            >
              <ArrowDownIcon />
              {t(cv.shortKey)}
              <span className="text-white/60">{t('contact_cv_pdf')}</span>
            </a>
          ))}
        </span>
      </span>
      <Link
        href={localeHref(lang, '/cv/react-native')}
        prefetch={false}
        aria-label={t('btn_view_cv')}
        className={`${CIRCLE} ${FOCUS} hover:border-white hover:bg-white/10`}
      >
        <ArrowUpRightIcon />
      </Link>
    </li>
  );
};

export default CvRow;
