import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  id: string;
  index: number;
  labelKey: string;
  children: ReactNode;
};

const Section = ({ id, index, labelKey, children }: Props) => {
  const { t } = useTranslation();

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t border-line bg-bg text-ink">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-7 px-6 py-20 min-[900px]:grid-cols-[280px_1fr] min-[900px]:gap-10 min-[900px]:px-10 min-[900px]:py-[120px]">
        <h2 id={`${id}-heading`} className="flex items-center gap-3 self-start font-mono text-xs font-normal uppercase tracking-[.08em] text-muted min-[900px]:sticky min-[900px]:top-24">
          <b className="font-medium text-wine-2">{String(index).padStart(2, '0')}</b>
          <span>{t(labelKey)}</span>
        </h2>
        <div>{children}</div>
      </div>
    </section>
  );
};

export default Section;
