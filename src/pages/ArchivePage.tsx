import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PROJECT_LIST } from '../data/projects';
import type { Project } from '../types/Project';

type Filter = 'all' | 'mobile' | 'web' | 'commercial';

const MONO = 'font-mono uppercase';
const TH = `${MONO} pb-3 text-left text-[11px] font-normal tracking-[.08em] text-muted`;
const CELL = 'min-[900px]:py-[18px] min-[900px]:align-middle';

const filterClass = (on: boolean) =>
  `${MONO} rounded-full border px-3.5 py-2 text-xs tracking-[.06em] transition-colors ${
    on ? 'border-wine bg-wine/[.18] text-ink' : 'border-chip text-muted-2 hover:text-ink'
  }`;

const ICON_LINK
  = 'inline-grid h-9 w-9 place-items-center rounded-full border border-chip text-[15px] text-ink '
  + 'transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

type LinkItem = { id: string; href: string; label: string; icon: string };

const Row = ({ project }: { project: Project }) => {
  const { t } = useTranslation();
  const {
    name, description, stack, type, year, poster, demolink, codelink, appStore, googlePlay,
  } = project;

  const links = [
    { id: 'live', href: demolink, label: t('btn_live_demo'), icon: '↗' },
    { id: 'code', href: codelink, label: t('btn_code'), icon: '⌥' },
    { id: 'appStore', href: appStore, label: t('btn_app_store'), icon: '' },
    { id: 'googlePlay', href: googlePlay, label: t('btn_google_play'), icon: '' },
  ].filter((l): l is LinkItem => Boolean(l.href));

  return (
    <tr
      data-testid="archive-row"
      className="border-b border-line transition-[background-color] hover:bg-[linear-gradient(90deg,rgba(139,20,38,.12),transparent_70%)] max-[899px]:grid max-[899px]:grid-cols-[76px_1fr] max-[899px]:gap-x-4 max-[899px]:gap-y-2 max-[899px]:py-5"
    >
      <td className={`${CELL} w-[76px] max-[899px]:row-span-4`}>
        <div className="h-10 w-[60px] overflow-hidden rounded-lg border border-[#232327]">
          <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      </td>
      <td className={`${CELL} w-20 font-mono text-[13px] text-muted-2 max-[899px]:order-2 max-[899px]:col-start-2`}>
        {year}
      </td>
      <td className={`${CELL} text-[19px] font-medium max-[899px]:order-1 max-[899px]:col-start-2`}>
        {name}
        <small className="mt-[3px] block text-[13px] font-normal text-muted-2">{t(description)}</small>
      </td>
      <td className={`${CELL} w-[120px] max-[899px]:order-3 max-[899px]:col-start-2`}>
        <span
          className={`${MONO} inline-block rounded-full border px-2.5 py-1 text-[11px] tracking-[.05em] ${
            type === 'mobile' ? 'border-wine-3/50 text-[#F2B8C2]' : 'border-chip text-[#C9C9CE]'
          }`}
        >
          {t(`project_type_${type}`)}
        </span>
      </td>
      <td className={`${CELL} max-[899px]:order-4 max-[899px]:col-start-2`}>
        <ul className="flex flex-wrap gap-1.5">
          {stack.map(tech => (
            <li
              key={tech}
              className={`${MONO} rounded-full border border-chip px-2.5 py-[5px] text-[11px] leading-[normal] tracking-[.04em] text-[#C9C9CE]`}
            >
              {tech}
            </li>
          ))}
        </ul>
      </td>
      <td className={`${CELL} whitespace-nowrap text-right max-[899px]:order-5 max-[899px]:col-span-2 max-[899px]:text-left`}>
        <span className="inline-flex gap-1.5">
          {links.map(({ id, href, label, icon }) => (
            <a
              key={id}
              href={href}
              aria-label={`${label} — ${name}`}
              target="_blank"
              rel="noreferrer"
              className={icon ? ICON_LINK : `${ICON_LINK} w-auto px-3 text-xs`}
            >
              {icon || <span>{label} ↗</span>}
            </a>
          ))}
        </span>
      </td>
    </tr>
  );
};

/** Every project in a filterable table (the home page shows only the featured few). */
const ArchivePage = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { filters, from, to } = useMemo(() => {
    const count = (fn: (p: Project) => boolean) => PROJECT_LIST.filter(fn).length;
    const years = PROJECT_LIST.map(p => p.year);
    const list: { value: Filter; label: string }[] = [
      { value: 'all', label: t('archive_filter_all', { count: PROJECT_LIST.length }) },
      { value: 'mobile', label: t('archive_filter_mobile', { count: count(p => p.type === 'mobile') }) },
      { value: 'web', label: t('archive_filter_web', { count: count(p => p.type === 'web') }) },
    ];

    // Shown only once a commercial project exists.
    if (PROJECT_LIST.some(p => p.commercial)) {
      list.push({
        value: 'commercial',
        label: t('archive_filter_commercial', { count: count(p => Boolean(p.commercial)) }),
      });
    }

    return { filters: list, from: Math.min(...years), to: Math.max(...years) };
  }, [t]);

  const visible = PROJECT_LIST.filter(p => {
    if (filter === 'all') {
      return true;
    }

    if (filter === 'commercial') {
      return Boolean(p.commercial);
    }

    return p.type === filter;
  });

  return (
    <div className="mx-auto max-w-[1120px] bg-bg px-6 pb-20 pt-28 text-ink min-[900px]:px-10 min-[900px]:pb-[112px] min-[900px]:pt-[140px]">
      <nav aria-label={t('archive_breadcrumb_label')} className={`${MONO} mb-7 text-xs tracking-[.06em] text-muted-2`}>
        <Link to="/" className="transition-colors hover:text-ink">{t('archive_crumb_home')}</Link>
        {' / '}
        <b className="font-medium text-ink" aria-current="page">{t('archive_crumb_archive')}</b>
      </nav>

      <div className="mb-9 flex flex-col gap-6 min-[900px]:flex-row min-[900px]:items-end min-[900px]:justify-between">
        <div>
          <h1 className="text-[clamp(44px,6vw,64px)] font-medium leading-none tracking-[-0.045em]">
            {t('archive_title')}
          </h1>
          <p className="mt-3 text-base text-ink-2">
            {t('archive_summary', { count: PROJECT_LIST.length, from, to })}
          </p>
        </div>
        <div role="group" aria-label={t('archive_filters_label')} className="flex flex-wrap gap-1.5">
          {filters.map(f => (
            <button
              key={f.value}
              type="button"
              aria-pressed={f.value === filter}
              onClick={() => setFilter(f.value)}
              className={filterClass(f.value === filter)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="border-y border-line py-16 text-center text-muted-2">{t('archive_empty')}</p>
      ) : (
        <table className="w-full border-collapse max-[899px]:block">
          <thead className="max-[899px]:hidden">
            <tr className="border-b border-line">
              <th className={TH}><span className="sr-only">{t('archive_col_project')}</span></th>
              <th scope="col" className={TH}>{t('archive_col_year')}</th>
              <th scope="col" className={TH}>{t('archive_col_project')}</th>
              <th scope="col" className={TH}>{t('archive_col_type')}</th>
              <th scope="col" className={TH}>{t('archive_col_stack')}</th>
              <th scope="col" className={`${TH} text-right`}>{t('archive_col_links')}</th>
            </tr>
          </thead>
          <tbody className="max-[899px]:block">
            {visible.map(p => <Row key={p.id} project={p} />)}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ArchivePage;
