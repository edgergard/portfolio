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
      <div className="mx-auto max-w-[1120px] px-6 py-20 min-[900px]:px-10 min-[900px]:py-[112px]">
        <h2
          id={`${id}-heading`}
          className="mb-10 flex items-center gap-3 font-mono text-[13px] font-normal uppercase tracking-[.08em] text-ink-2 min-[900px]:mb-14"
        >
          <b className="font-medium text-wine-2">{String(index).padStart(2, '0')}</b>
          <i aria-hidden className="inline-block h-px w-6 bg-[#3A3A40]" />
          <span>{t(labelKey)}</span>
        </h2>
        <div>{children}</div>
      </div>
    </section>
  );
};

export default Section;
