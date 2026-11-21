'use client';

import { useT } from '@/lib/i18n-client';

const BackToTop = () => {
  const t = useT();

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="text-left uppercase transition-colors hover:text-ink"
    >
      {t('footer_top')}
    </button>
  );
};

export default BackToTop;
