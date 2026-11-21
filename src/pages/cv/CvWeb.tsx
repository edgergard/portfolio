import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import SkillsBand from '../../components/About/SkillsBand';
import SkillsList, { SkillsHeading } from '../../components/About/SkillsList';
import EducationCard, { EDU_CARD_FRAME } from '../../components/Experience/EducationCard';
import { BrandIcon, type Brand } from '../../components/Contact/icons';
import WineCanvas from '../../components/ui/WineCanvas';
import type { CvDoc } from '../../data/cv';

/** The CV page's content column (width and side gutters); the skills band spans past it. */
export const CV_COLUMN = 'mx-auto max-w-[1280px] px-6 min-[900px]:px-10';

const label = 'font-mono text-xs uppercase tracking-[.06em]';

const Heading = SkillsHeading;

const Block = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-14">
    <Heading>{title}</Heading>
    {children}
  </section>
);

const Bullets = ({ items, className }: { items: string[]; className: string }) => (
  <ul className={`${className} grid max-w-[64ch] list-none gap-2 text-base leading-[1.55] text-ink-2`}>
    {items.map(b => (
      <li key={b} className="relative pl-5 before:absolute before:left-0 before:text-wine-3 before:content-['—']">
        {b}
      </li>
    ))}
  </ul>
);

const platform = (href: string): { key: 'email' | 'telegram' | 'linkedin' | 'github'; brand: Brand; value: string } => {
  if (href.startsWith('mailto:')) {
    return { key: 'email', brand: 'gmail', value: href.slice(7) };
  }

  if (href.includes('t.me/')) {
    return { key: 'telegram', brand: 'telegram', value: `@${href.split('t.me/')[1]}` };
  }

  if (href.includes('linkedin.com')) {
    return { key: 'linkedin', brand: 'linkedin', value: href.split('/in/')[1].replace(/\/$/, '') };
  }

  return { key: 'github', brand: 'github', value: href.split('github.com/')[1] };
};

/** Icon tile with the live Wine shader (registered like a primary button; .bg-wine-flow is the fallback). */
const ContactTile = ({ brand }: { brand: Brand }) => (
  <span aria-hidden className="bg-wine-flow relative isolate grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[10px] text-white">
    <WineCanvas />
    <BrandIcon brand={brand} size={16} />
  </span>
);

const CvWeb = ({ doc }: { doc: CvDoc }) => {
  const { t } = useTranslation();

  return (
    <article>
      <div className={CV_COLUMN}>
        <p className="max-w-[64ch] text-lg leading-[1.55] text-ink-2">{doc.summary}</p>
        <ul className="mt-6 flex list-none flex-wrap gap-3">
          {doc.contacts.map(c => {
            const { key, brand, value } = platform(c.href);
            const name = t(`cv_contact_${key}`);

            return (
              <li key={c.href}>
                <a
                  href={c.href}
                  aria-label={`${name}: ${value}`}
                  className="inline-flex items-center gap-3 rounded-[14px] border border-line bg-surface py-2 pl-2 pr-[18px] transition-colors hover:border-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  <ContactTile brand={brand} />
                  <span className="flex flex-col">
                    <span className="mb-0.5 font-mono text-[10px] uppercase leading-none tracking-[.08em] text-muted-2">{name}</span>
                    <span className="text-sm text-ink">{value}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <Block title={t('cv_experience')}>
          <div className="border-t border-line">
            {doc.experience.map(job => (
              <div
                key={`${job.company}-${job.period}`}
                className="grid grid-cols-1 gap-2.5 border-b border-line py-9 min-[900px]:grid-cols-[200px_1fr] min-[900px]:gap-8"
              >
                <div className={`${label} pt-2 text-muted-2`}>{job.period}</div>
                <div>
                  <h3 className="text-[26px] font-medium tracking-[-0.025em]">
                    {job.role} <span className="font-normal text-rose">· {job.company}</span>
                  </h3>
                  <Bullets items={job.bullets} className="mt-4" />
                  {job.projects?.map(p => (
                    <div key={p.title} data-testid="cv-project" className="mt-7">
                      <h4 className="text-lg font-medium tracking-[-0.01em] text-ink">
                        {p.title}
                        {p.stack && <span className="ml-3 font-mono text-[11px] font-normal tracking-[.04em] text-muted">{p.stack}</span>}
                      </h4>
                      <Bullets items={p.bullets} className="mt-3" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Block>
      </div>

      <section className="mt-14">
        <div className={CV_COLUMN}>
          <Heading>{t('cv_skills')}</Heading>
        </div>
        <SkillsBand column={CV_COLUMN}>
          <SkillsList rows={doc.skills} data-testid="cv-skills" />
        </SkillsBand>
      </section>

      <div className={CV_COLUMN}>
        <Block title={t('cv_education')}>
          <div className="grid grid-cols-1 gap-5 min-[860px]:grid-cols-3">
            {doc.education.map(e => (
              <div key={e.institution} data-testid="edu-card" className={EDU_CARD_FRAME}>
                <EducationCard
                  kind={t(`edu_kind_${e.kind}`)}
                  period={e.period}
                  institution={e.institution}
                  programme={e.programme}
                  programmeLabel={t('edu_programme_label')}
                />
              </div>
            ))}
          </div>
        </Block>

        <Block title={t('cv_languages')}>
          <ul className="grid list-none grid-cols-1 gap-5 min-[620px]:grid-cols-2 min-[1100px]:max-w-[66%]">
            {doc.languages.map(l => (
              <li key={l.name} data-testid="lang-card" className="wine-edge flex">
                <div className="flex flex-1 flex-col gap-5 rounded-[19px] bg-[linear-gradient(200deg,rgb(var(--c-surface-2))_0%,rgb(var(--c-bg))_65%)] p-7">
                  <span className="font-mono text-[13px] uppercase tracking-[.08em] text-soft-3">{l.name}</span>
                  <span className="text-[48px] font-medium leading-none tracking-[-0.045em] text-ink min-[900px]:text-[60px]">
                    {l.level}
                  </span>
                  {l.note && <span className="text-[17px] leading-tight text-soft-2">{l.note}</span>}
                </div>
              </li>
            ))}
          </ul>
        </Block>
      </div>
    </article>
  );
};

export default CvWeb;
