import { useTranslation } from 'react-i18next';
import { FACTS, SKILLS } from '../../data/content';
import Reveal from '../layout/Reveal';
import Section from '../layout/Section';

const About = () => {
  const { t } = useTranslation();

  return (
    <Section id="about" index={1} labelKey="section_about">
      <Reveal>
        <h2 className="max-w-[20ch] text-[clamp(32px,3.6vw,52px)] font-medium leading-[1.08] tracking-[-0.035em]">
          {t('about_headline_main')} <em className="not-italic text-muted-2">{t('about_headline_accent')}</em>
        </h2>
        <p className="mt-10 max-w-[62ch] text-[17px] leading-[1.65] text-ink-2">{t('about_paragraph')}</p>

        <div className="mt-16 grid grid-cols-1 border-t border-line min-[900px]:grid-cols-4">
          {FACTS.map(fact => (
            <div
              key={fact.labelKey}
              data-testid="fact"
              className="pt-6 min-[900px]:border-l min-[900px]:border-line min-[900px]:px-6 min-[900px]:first:border-l-0 min-[900px]:first:pl-0"
            >
              <div className="font-mono text-xs uppercase tracking-[.06em] text-muted">{t(fact.labelKey)}</div>
              <div className="mt-2.5 text-[32px] font-medium leading-[normal] tracking-[-0.03em]">
                {fact.value}
                <small className="ml-1 text-[15px] font-normal text-muted-2">{t(fact.unitKey)}</small>
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
