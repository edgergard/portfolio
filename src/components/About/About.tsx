import { useTranslation } from 'react-i18next';
import { FACTS, SKILLS } from '../../data/content';
import Reveal from '../layout/Reveal';
import Section from '../layout/Section';

const About = () => {
  const { t } = useTranslation();

  return (
    <Section id="about" index={1} labelKey="section_about">
      <Reveal>
        <p className="max-w-[20ch] text-[clamp(32px,3.6vw,52px)] font-medium leading-[1.08] tracking-[-0.035em]">
          {t('about_headline_main')} <em className="not-italic text-muted-2">{t('about_headline_accent')}</em>
        </p>
        <p className="mt-10 max-w-[62ch] text-[17px] leading-[1.65] text-ink-2">{t('about_paragraph')}</p>

        <div className="mt-16 grid grid-cols-1 border-t border-line min-[560px]:grid-cols-2 min-[1100px]:grid-cols-4">
          {FACTS.map(fact => (
            <div
              key={fact.labelKey}
              data-testid="fact"
              className="border-b border-line py-7 min-[560px]:odd:pr-6 min-[560px]:even:border-l min-[560px]:even:pl-6 min-[1100px]:border-b-0 min-[1100px]:border-l min-[1100px]:px-6 min-[1100px]:first:border-l-0 min-[1100px]:first:pl-0"
            >
              <div className="font-mono text-[13px] uppercase tracking-[.06em] text-[#B4B4BA] min-[900px]:text-sm">{t(fact.labelKey)}</div>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-[44px] font-medium leading-none tracking-[-0.045em] text-ink min-[900px]:text-[60px]">
                  {fact.value}
                </span>
                <small className="text-[18px] font-normal leading-tight text-[#D4D4D8] min-[900px]:text-[19px]">{t(fact.unitKey)}</small>
              </div>
            </div>
          ))}
        </div>

        <div
          data-testid="skills-panel"
          className="bg-wine-flow mt-14 rounded-[24px] hover:filter-none border border-white/10 p-6 shadow-[0_24px_80px_-32px_rgba(139,20,38,0.55)] min-[900px]:p-10"
        >
          <h3 className="font-mono text-[13px] font-normal uppercase tracking-[.08em] text-white/85">
            {t('about_skills_heading')}
          </h3>
          <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-8 min-[900px]:grid-cols-2">
            {SKILLS.map(group => (
              <div key={group.titleKey}>
                <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[.08em] text-white/75">
                  <i aria-hidden className="inline-block h-px w-4 bg-white/40" />
                  {t(group.titleKey)}
                </div>
                <ul className="mt-3.5 flex list-none flex-wrap gap-2">
                  {group.items.map(item => (
                    <li
                      key={item}
                      data-testid="skill-pill"
                      className="rounded-full border border-white/15 bg-[rgba(10,10,11,0.42)] px-4 py-2 text-[15px] font-medium leading-tight text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-colors duration-200 hover:border-white/35 hover:bg-[rgba(10,10,11,0.6)] min-[900px]:text-base"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
};

export default About;
