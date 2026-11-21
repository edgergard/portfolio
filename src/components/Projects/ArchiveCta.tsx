import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PROJECT_LIST } from '../../data/projects';
import { GLASS } from '../layout/Section';

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
 * the year range, a large "See all N projects", a stack of other projects' posters and a white
 * arrow disc that nudges right on hover.
 */
const ArchiveCta = () => {
  const { t } = useTranslation();
  const count = PROJECT_LIST.length;

  return (
    <Link
      to="/projects"
      aria-label={t('projects_archive_link', { count })}
      data-testid="archive-cta"
      className={
        `${GLASS} group flex w-full items-center gap-5 py-5 pl-6 pr-5 text-white transition-colors duration-200 `
        + 'hover:border-white/30 hover:bg-[rgba(10,10,11,0.65)] focus-visible:outline focus-visible:outline-2 '
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
          <img
            key={p.id}
            src={p.poster}
            alt=""
            loading="lazy"
            className="-ml-3.5 h-10 w-16 rounded-lg border-2 border-[#1a0a0e] object-cover object-top"
          />
        ))}
      </span>
      <span
        aria-hidden
        className={
          'ml-auto grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-white text-xl text-[#0A0A0B] '
          + 'transition-transform duration-200 group-hover:translate-x-[3px] min-[640px]:ml-0'
        }
      >
        →
      </span>
    </Link>
  );
};

export default ArchiveCta;
