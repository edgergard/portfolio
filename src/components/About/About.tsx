import { FACTS, SKILLS } from '../../data/content';
import { T } from '@/lib/i18n-client';
import Reveal from '../layout/Reveal';
import Section, { COLUMN } from '../layout/Section';
import SkillsBand from './SkillsBand';
import SkillsList, { SkillsHeading } from './SkillsList';

const Skills = () => (
  <Reveal className="mt-14">
    <div className={COLUMN}>
      <SkillsHeading as="h3"><T k="about_skills_heading" /></SkillsHeading>
    </div>
    <SkillsBand>
      <SkillsList
        rows={SKILLS.map(g => ({ id: g.titleKey, group: <T k={g.titleKey} />, items: g.items }))}
        data-testid="home-skills"
        itemTestId="skill-pill"
        magnify
      />
    </SkillsBand>
  </Reveal>
);

/** The About section. Server Component: text comes from <T>, the Core stack lens is client. */
const About = () => (
  <Section id="about" index={1} labelKey="section_about" bleed={<Skills />}>
    <Reveal>
      <p className="max-w-[20ch] text-[clamp(32px,3.6vw,52px)] font-medium leading-[1.08] tracking-[-0.035em]">
        <T k="about_headline_main" /> <em className="not-italic text-muted-2"><T k="about_headline_accent" /></em>
      </p>
      <p className="mt-10 max-w-[62ch] text-[17px] leading-[1.65] text-ink-2"><T k="about_paragraph" /></p>

      <div className="mt-16 grid grid-cols-1 border-t border-line min-[560px]:grid-cols-2 min-[1100px]:grid-cols-4">
        {FACTS.map(fact => (
          <div
            key={fact.labelKey}
            data-testid="fact"
            className="border-b border-line py-7 min-[560px]:odd:pr-6 min-[560px]:even:border-l min-[560px]:even:pl-6 min-[1100px]:border-b-0 min-[1100px]:border-l min-[1100px]:px-6 min-[1100px]:first:border-l-0 min-[1100px]:first:pl-0"
          >
            <div className="font-mono text-[13px] uppercase tracking-[.06em] text-soft-3 min-[900px]:text-sm"><T k={fact.labelKey} /></div>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="text-[44px] font-medium leading-none tracking-[-0.045em] text-ink min-[900px]:text-[60px]">
                {fact.value}
              </span>
              <small className="text-[18px] font-normal leading-tight text-soft-2 min-[900px]:text-[19px]"><T k={fact.unitKey} /></small>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  </Section>
);

export default About;
