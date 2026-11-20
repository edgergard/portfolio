import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { CvDoc } from '../../data/cv';

const label = 'font-mono text-xs uppercase tracking-[.06em]';

const Block = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-14">
    <h2 className={`${label} mb-5 text-muted`}>{title}</h2>
    {children}
  </section>
);

const CvWeb = ({ doc }: { doc: CvDoc }) => {
  const { t } = useTranslation();

  return (
    <article>
      <p className="max-w-[64ch] text-lg leading-[1.55] text-ink-2">{doc.summary}</p>
      <ul className="mt-6 flex list-none flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted-2">
        {doc.contacts.map(c => (
          <li key={c.href}>
            <a href={c.href} className="transition-colors hover:text-wine-3">
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
                  {job.role} <span className="font-normal text-muted-2">· {job.company}</span>
                </h3>
                <ul className="mt-4 grid max-w-[64ch] list-none gap-2 text-base leading-[1.55] text-ink-2">
                  {job.bullets.map(b => (
                    <li key={b} className="relative pl-5 before:absolute before:left-0 before:text-[#5A5A60] before:content-['—']">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block title={t('cv_skills')}>
        <dl className="grid gap-4">
          {doc.skills.map(s => (
            <div key={s.group} className="grid grid-cols-1 gap-1.5 min-[900px]:grid-cols-[200px_1fr] min-[900px]:gap-8">
              <dt className={`${label} pt-1 text-muted-2`}>{s.group}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {s.items.map(i => (
                  <span
                    key={i}
                    className="rounded-full border border-chip px-2.5 py-[5px] font-mono text-[11px] tracking-[.02em] text-[#C9C9CE]"
                  >
                    {i}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block title={t('cv_education')}>
        <div className="grid grid-cols-1 gap-6 min-[900px]:grid-cols-3">
          {doc.education.map(e => (
            <div key={e.title} className="rounded-2xl border border-line p-6">
              <div className={`${label} text-muted`}>{e.period}</div>
              <h4 className="mt-2.5 text-lg font-medium leading-[1.35] tracking-[-0.01em]">{e.title}</h4>
            </div>
          ))}
        </div>
      </Block>

      <Block title={t('cv_languages')}>
        <ul className="flex list-none flex-wrap gap-x-8 gap-y-2 text-base text-ink-2">
          {doc.languages.map(l => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </Block>
    </article>
  );
};

export default CvWeb;
