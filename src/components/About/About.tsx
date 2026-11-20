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

        <div className="mt-14 grid grid-cols-1 gap-6 min-[900px]:grid-cols-4">
          {SKILLS.map(group => (
            <div key={group.titleKey}>
              <div className="font-mono text-xs uppercase tracking-[.06em] text-muted">{t(group.titleKey)}</div>
              <ul className="mt-3.5 grid list-none gap-2 text-base leading-[normal]">
                {group.items.map(item => (
                  <li key={item} className="flex items-center gap-2.5 before:size-1 before:shrink-0 before:rounded-full before:bg-[#5A5A60] before:content-['']">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
};

export default About;
