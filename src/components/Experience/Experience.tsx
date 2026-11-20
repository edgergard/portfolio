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

      <Reveal className="mt-14 grid grid-cols-1 gap-6 min-[900px]:grid-cols-2">
        {EDUCATION.map(edu => (
          <div key={edu.titleKey} data-testid="edu-card" className="rounded-2xl border border-line p-6">
            <div className="font-mono text-xs uppercase tracking-[.06em] text-muted">{t(edu.metaKey)}</div>
            <h4 className="mt-2.5 text-lg font-medium leading-[1.35] tracking-[-0.01em]">{t(edu.titleKey)}</h4>
          </div>
        ))}
      </Reveal>
    </Section>
  );
};

export default Experience;
