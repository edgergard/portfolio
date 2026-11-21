import { useTranslation } from 'react-i18next';
import { EDUCATION, JOBS, type Job } from '../../data/content';
import Reveal from '../layout/Reveal';
import Section from '../layout/Section';
import WineCanvas from '../ui/WineCanvas';
import EducationCard, { EDU_CARD_FRAME } from './EducationCard';

/** Metric tile / stack badge surface: the live Wine shader over the CSS wine-flow fill (no hover lift: not interactive). */
const WINE_FILL = 'bg-wine-flow hover:filter-none border';

/**
 * One job inside the .wine-edge frame: monogram, role and company line, period and duration;
 * three metric tiles; the bullets in a native "What I did" disclosure; the stack as badges.
 */
const JobCard = ({ job, open }: { job: Job; open: boolean }) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-[19px] bg-[linear-gradient(160deg,rgb(var(--c-surface)),rgb(var(--c-bg))_70%)] p-5 min-[640px]:p-[30px]">
      <div className="mb-[22px] grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 min-[640px]:grid-cols-[auto_1fr_auto] min-[640px]:gap-x-5">
        <div
          aria-hidden
          data-testid="xp-monogram"
          className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[linear-gradient(140deg,#8B1426,#3E0712)] text-[20px] font-semibold text-white min-[640px]:h-14 min-[640px]:w-14 min-[640px]:text-[22px]"
        >
          {job.company[0]}
        </div>
        <div>
          <h3 className="text-[20px] font-medium leading-tight tracking-[-0.02em] min-[640px]:text-2xl">{t(job.roleKey)}</h3>
          <div className="mt-1 text-balance text-sm text-ink-2">{t(job.companyLineKey)}</div>
        </div>
        <div className="col-span-2 flex items-baseline gap-3 min-[640px]:col-span-1 min-[640px]:block min-[640px]:text-right">
          <b className="block text-[17px] font-medium min-[640px]:text-lg">{t(job.periodKey)}</b>
          <span className="font-mono text-xs uppercase tracking-[.07em] text-ink-2">{t(job.durationKey)}</span>
        </div>
      </div>

      <div className="mb-[22px] grid grid-cols-1 gap-3 min-[640px]:grid-cols-3">
        {job.metrics.map(m => (
          <div key={m.valueKey} data-testid="xp-metric" className={`${WINE_FILL} rounded-[14px] border-white/[.12] p-4`}>
            <WineCanvas />
            <b className="block text-[26px] font-medium leading-tight tracking-[-0.03em] text-white min-[1100px]:text-[30px]">
              {t(m.valueKey)}
            </b>
            <span className="text-[13px] leading-snug text-white/[.88]">{t(m.labelKey)}</span>
          </div>
        ))}
      </div>

      <details open={open} className="group">
        <summary className="mb-3.5 mt-1.5 inline-flex cursor-pointer list-none items-center gap-1.5 font-mono text-xs uppercase tracking-[.07em] text-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
          {t('xp_details_summary')}
          <span aria-hidden className="text-[#D0213F] transition-transform duration-200 group-open:rotate-180">↓</span>
        </summary>
        <ul className="grid max-w-[72ch] list-none gap-[9px] text-[15.5px] leading-6 text-soft-2">
          {job.bulletKeys.map(key => (
            <li
              key={key}
              className="relative pl-5 before:absolute before:left-0.5 before:top-[11px] before:h-px before:w-2 before:bg-[#D0213F] before:content-['']"
            >
              {t(key)}
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-[18px]">
        {job.stack.map(tag => (
          <span
            key={tag}
            data-testid="xp-badge"
            className={`${WINE_FILL} rounded-full border-white/[.18] px-2.5 py-[5px] font-mono text-[11px] uppercase leading-[normal] tracking-[.04em] text-white`}
          >
            <WineCanvas />
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

const Experience = () => {
  const { t } = useTranslation();

  return (
    <Section id="experience" index={2} labelKey="section_experience">
      <div className="grid gap-[22px]">
        {JOBS.map((job, i) => (
          <Reveal key={job.id} testId="xp-card" className="wine-edge">
            <JobCard job={job} open={i === 0} />
          </Reveal>
        ))}
      </div>

      <h3 className="mb-6 mt-16 flex items-center gap-3 font-mono text-[13px] font-normal uppercase tracking-[.08em] text-ink-2">
        <i aria-hidden className="inline-block h-px w-6 bg-rule" />
        {t('edu_heading')}
      </h3>
      <div className="grid grid-cols-1 gap-5 min-[860px]:grid-cols-3">
        {EDUCATION.map(edu => (
          <Reveal key={edu.id} testId="edu-card" className={EDU_CARD_FRAME}>
            <EducationCard
              kind={t(`edu_kind_${edu.kind}`)}
              period={t(edu.periodKey)}
              institution={t(edu.institutionKey)}
              programme={t(edu.programmeKey)}
              programmeLabel={t('edu_programme_label')}
            />
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default Experience;
