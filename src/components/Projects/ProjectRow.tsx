import { useTranslation } from 'react-i18next';
import { Project } from '../../types/Project';

type Props = {
  project: Project;
  index: number;
  reverse: boolean;
};

const ProjectRow = ({ project, index, reverse }: Props) => {
  const { t } = useTranslation();
  const { name, poster, description, stack, codelink, demolink, category } = project;
  const num = String(index + 1).padStart(2, '0');

  return (
    <article
      data-testid="project-row"
      data-reverse={reverse}
      className="group grid grid-cols-1 items-center gap-8 min-[900px]:grid-cols-[1.35fr_1fr] min-[900px]:gap-12"
    >
      <div
        className={`relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-[#111] ${
          reverse ? 'min-[900px]:order-2' : ''
        }`}
      >
        <img
          src={poster}
          alt=""
          loading="lazy"
          className="block h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.035]"
        />
      </div>

      <div>
        <div className="font-mono text-xs tracking-[.08em] text-wine-2">
          {num} — {category}
        </div>
        <h3 className="my-3 text-[30px] font-medium tracking-[-.03em] text-ink">{name}</h3>
        <p className="max-w-[44ch] text-base leading-[1.6] text-ink-2">{t(description)}</p>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {stack.map((tech) => (
            <li
              key={tech}
              className="rounded-full border border-chip px-2.5 py-[5px] font-mono text-[11px] uppercase leading-[normal] tracking-[.04em] text-[#C9C9CE]"
            >
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex gap-5 text-sm font-medium text-ink">
          {demolink && <a
            href={demolink}
            aria-label={`${t('btn_live_demo')} — ${name}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border-b border-wine pb-[3px] transition-colors hover:border-ink"
          >
            {t('btn_live_demo')} <span aria-hidden="true">↗</span>
          </a>}
          {codelink && <a
            href={codelink}
            aria-label={`${t('btn_code')} — ${name}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border-b border-[#3A3A40] pb-[3px] transition-colors hover:border-ink"
          >
            {t('btn_code')} <span aria-hidden="true">↗</span>
          </a>}
        </div>
      </div>
    </article>
  );
};

export default ProjectRow;
