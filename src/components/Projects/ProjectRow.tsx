import { useTranslation } from 'react-i18next';
import { Project } from '../../types/Project';
import ProjectMedia from './ProjectMedia';

type Props = {
  project: Project;
  index: number;
  reverse: boolean;
};

const LINK = 'inline-flex items-center gap-2 border-b border-white pb-[3px] transition-colors hover:border-wine-3';

/** A featured project in a dark glass panel over the wine band: media one side, text the other. */
const ProjectRow = ({ project, index, reverse }: Props) => {
  const { t } = useTranslation();
  const { name, description, stack, codelink, demolink, appStore, googlePlay, type, year }
    = project;
  const num = String(index + 1).padStart(2, '0');

  const links = [
    { id: 'live', href: demolink, label: t('btn_live_demo') },
    { id: 'code', href: codelink, label: t('btn_code') },
    { id: 'appStore', href: appStore, label: t('btn_app_store') },
    { id: 'googlePlay', href: googlePlay, label: t('btn_google_play') },
  ].filter((l): l is { id: string; href: string; label: string } => Boolean(l.href));

  return (
    <article
      data-testid="project-row"
      data-reverse={reverse}
      className="grid grid-cols-1 items-center gap-6 rounded-[28px] border border-white/10 bg-[rgba(10,10,11,0.55)] p-5 backdrop-blur-[14px] min-[900px]:grid-cols-[1.35fr_1fr] min-[900px]:gap-14 min-[900px]:p-9"
    >
      <div className={reverse ? 'min-[900px]:order-2' : ''}>
        <ProjectMedia project={project} />
      </div>

      <div>
        <div className="font-mono text-xs uppercase tracking-[.07em] text-wine-3">
          {num} — {t(`project_type_${type}`)} · {year}
        </div>
        <h3 className="my-3 text-[28px] font-medium leading-tight tracking-[-.03em] text-ink min-[900px]:text-[34px]">
          {name}
        </h3>
        <p className="mb-[18px] max-w-[42ch] text-base leading-[1.6] text-white/[.82]">{t(description)}</p>

        <ul className="flex flex-wrap gap-1.5">
          {stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-white/25 bg-[rgba(10,10,11,0.25)] px-2.5 py-[5px] font-mono text-[11px] uppercase leading-[normal] tracking-[.04em] text-white"
            >
              {tech}
            </li>
          ))}
        </ul>

        {links.length > 0 && (
          <div className="mt-[22px] flex flex-wrap items-center gap-[18px] text-[15px] font-medium text-ink">
            {links.map(({ id, href, label }) => (
              <a
                key={id}
                href={href}
                aria-label={`${label} — ${name}`}
                target="_blank"
                rel="noreferrer"
                className={LINK}
              >
                {label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default ProjectRow;
