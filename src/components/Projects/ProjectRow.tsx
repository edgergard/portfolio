'use client';

import { useT } from '@/lib/i18n-client';
import { GLASS } from '../layout/Section';
import type { Project } from '../../types/Project';
import ProjectMedia from './ProjectMedia';
import WineBadge from '../ui/WineBadge';

type Props = {
  project: Project;
  index: number;
  reverse: boolean;
};

const LINK = 'inline-flex items-center gap-2 border-b border-white pb-[3px] transition-colors hover:border-wine-3';

/**
 * A featured project in a dark glass panel over the wine band: media one side, text the other.
 * A client component: the links' aria-labels are translated strings.
 */
const ProjectRow = ({ project, index, reverse }: Props) => {
  const t = useT();
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
      className={
        `${GLASS} grid h-full grid-cols-1 items-center gap-6 p-5 min-[900px]:gap-14 min-[900px]:p-9 `
        // The media column is the wide one on either side, so every frame comes out the same size.
        + (reverse
          ? 'min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]'
          : 'min-[900px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]')
      }
    >
      <div className={reverse ? 'min-[900px]:order-2' : ''}>
        <ProjectMedia project={project} />
      </div>

      <div>
        <div className="font-mono text-xs uppercase tracking-[.07em] text-wine-3">
          {num} — {t(`project_type_${type}`)} · {year}
        </div>
        <h3 className="my-3 text-[28px] font-medium leading-tight tracking-[-.03em] text-white min-[900px]:text-[34px]">
          {name}
        </h3>
        <p className="mb-[18px] max-w-[42ch] text-base leading-[1.6] text-white/[.82]">{t(description)}</p>

        <ul className="flex flex-wrap gap-1.5">
          {stack.map((tech) => (
            <WineBadge key={tech} as="li" data-testid="project-badge">{tech}</WineBadge>
          ))}
        </ul>

        {links.length > 0 && (
          <div className="mt-[22px] flex flex-wrap items-center gap-[18px] text-[15px] font-medium text-white">
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
