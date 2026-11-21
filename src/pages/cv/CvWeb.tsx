import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import SkillsBand from '../../components/About/SkillsBand';
import EducationCard, { EDU_CARD_FRAME } from '../../components/Experience/EducationCard';
import type { CvDoc } from '../../data/cv';

/** The CV page's content column (width and side gutters); the skills band spans past it. */
export const CV_COLUMN = 'mx-auto max-w-[1280px] px-6 min-[900px]:px-10';

const label = 'font-mono text-xs uppercase tracking-[.06em]';

const Heading = ({ children }: { children: ReactNode }) => (
  <h2 className={`${label} mb-5 flex items-center gap-2.5 text-muted before:h-px before:w-4 before:bg-wine-3 before:content-['']`}>{children}</h2>
);

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

const CvWeb = ({ doc }: { doc: CvDoc }) => {
  const { t } = useTranslation();

  return (
    <article>
      <div className={CV_COLUMN}>
        <p className="max-w-[64ch] text-lg leading-[1.55] text-ink-2">{doc.summary}</p>
        <ul className="mt-6 flex list-none flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted-2">
          {doc.contacts.map(c => (
            <li key={c.href}>
              <a href={c.href} className="border-b border-wine-3/70 pb-px transition-colors hover:text-wine-3">
                {c.label}
              </a>
            </li>
          ))}
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
                    {job.role} <span className="font-normal text-[#FF8A9B]">· {job.company}</span>
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
          <dl data-testid="cv-skills" className="grid gap-4">
            {doc.skills.map(s => (
              <div key={s.group} className="grid grid-cols-1 gap-1.5 min-[900px]:grid-cols-[200px_1fr] min-[900px]:gap-8">
                <dt className={`${label} pt-1 text-white/75`}>{s.group}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {s.items.map(i => (
                    <span
                      key={i}
                      className="rounded-full border border-white/20 bg-[rgba(10,10,11,.4)] px-2.5 py-[5px] font-mono text-[11px] tracking-[.02em] text-[#E4E4E7]"
                    >
                      {i}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
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
                <div className="flex flex-1 flex-col gap-5 rounded-[19px] bg-[linear-gradient(200deg,#141416_0%,#0A0A0B_65%)] p-7">
                  <span className="font-mono text-[13px] uppercase tracking-[.08em] text-[#B4B4BA]">{l.name}</span>
                  <span className="text-[48px] font-medium leading-none tracking-[-0.045em] text-ink min-[900px]:text-[60px]">
                    {l.level}
                  </span>
                  {l.note && <span className="text-[17px] leading-tight text-[#D4D4D8]">{l.note}</span>}
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
