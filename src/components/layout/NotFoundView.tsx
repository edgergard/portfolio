import type { ReactNode } from 'react';
import { COLUMN } from './Section';

type Props = { label: ReactNode; title: ReactNode; text: ReactNode; action: ReactNode };

/**
 * The 404 layout shared by [lang]/not-found (inside the site chrome) and global-not-found
 * (unmatched URLs): the section-label line, the archive-style h1, a line of text and a home link.
 */
const NotFoundView = ({ label, title, text, action }: Props) => (
  <div className={`${COLUMN} flex min-h-screen flex-col items-start justify-center py-28`}>
    <p className="mb-6 flex items-center gap-3 font-mono text-[13px] uppercase tracking-[.08em] text-ink-2">
      <b className="font-medium text-wine-2">404</b>
      <i aria-hidden className="inline-block h-px w-6 bg-rule" />
      <span>{label}</span>
    </p>
    <h1 className="text-[clamp(44px,6vw,64px)] font-medium leading-none tracking-[-0.045em] text-ink">
      {title}
    </h1>
    <p className="mb-10 mt-4 max-w-[52ch] text-base text-ink-2">{text}</p>
    {action}
  </div>
);

export default NotFoundView;
