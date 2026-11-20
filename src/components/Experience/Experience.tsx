import { useTranslation } from 'react-i18next';
import { EDUCATION, JOBS } from '../../data/content';
import Reveal from '../layout/Reveal';
import Section from '../layout/Section';

const Experience = () => {
  const { t } = useTranslation();

  return (
    <Section id="experience" index={2} labelKey="section_experience">
      <div className="border-t border-line">
        {JOBS.map(job => (
          <Reveal
            key={job.id}
            testId="xp-row"
            className="group relative grid grid-cols-1 gap-2.5 border-b border-line py-9 min-[900px]:grid-cols-[200px_1fr] min-[900px]:gap-8"
          >
            <span
              aria-hidden
              className="absolute bottom-9 top-9 hidden w-0.5 origin-top scale-y-0 bg-wine-2 transition-transform duration-[350ms] ease-out group-hover:scale-y-100 min-[900px]:-left-10 min-[900px]:block"
            />
            <div className="pt-2 font-mono text-xs uppercase tracking-[.06em] text-muted-2">{t(job.periodKey)}</div>
            <div>
              <h3 className="text-[26px] font-medium leading-[normal] tracking-[-0.025em]">
                {t(job.roleKey)}{' '}
                <span className="font-normal text-muted-2">· {job.companyKey ? t(job.companyKey) : job.company}</span>
              </h3>
              <ul className="mt-4 grid max-w-[64ch] list-none gap-2 text-base leading-[1.55] text-ink-2">
                {job.bulletKeys.map(key => (
                  <li key={key} className="relative pl-5 before:absolute before:left-0 before:text-[#5A5A60] before:content-['—']">
                    {t(key)}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {job.stack.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-chip px-2.5 py-[5px] font-mono text-[11px] uppercase leading-[normal] tracking-[.04em] text-[#C9C9CE]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <h3 className="mb-6 mt-16 flex items-center gap-3 font-mono text-[13px] font-normal uppercase tracking-[.08em] text-ink-2">
        <i aria-hidden className="inline-block h-px w-6 bg-[#3A3A40]" />
        {t('edu_heading')}
      </h3>
      <div className="grid grid-cols-1 gap-5 min-[860px]:grid-cols-3">
        {EDUCATION.map(edu => (
          <Reveal
            key={edu.id}
            testId="edu-card"
            className="group flex flex-col gap-6 rounded-[20px] border border-line bg-[linear-gradient(200deg,#141416_0%,#0A0A0B_65%)] p-7 transition-colors duration-300 hover:border-[#5E0C1C]"
          >
            <span className="font-mono text-xs uppercase tracking-[.08em] text-[#B4B4BA]">{t(`edu_kind_${edu.kind}`)}</span>
            <div className="text-[34px] font-medium leading-none tracking-[-0.04em] text-ink min-[860px]:text-[30px] min-[1100px]:text-[36px]">
              {t(edu.periodKey)}
            </div>
            <h4 className="text-[19px] font-medium leading-[1.3] tracking-[-0.015em] text-ink">{t(edu.institutionKey)}</h4>
            <div className="mt-auto border-t border-line pt-5">
              <div className="font-mono text-[11px] uppercase tracking-[.08em] text-muted-2">{t('edu_programme_label')}</div>
              <p className="mt-2 text-[15px] leading-[1.45] text-[#D4D4D8] min-[860px]:min-h-[2.9em]">{t(edu.programmeKey)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default Experience;
