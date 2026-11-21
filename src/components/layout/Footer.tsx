import { useTranslation } from 'react-i18next';
import { useClientValue } from '../../utils/clientValue';

const noSubscribe = () => () => {};

const thisYear = () => new Date().getFullYear();

const Footer = () => {
  const { t } = useTranslation();
  // The prerendered page carries the build year; the visit year takes over after hydration.
  const year = useClientValue(noSubscribe, thisYear, __BUILD_YEAR__);

  return (
    <footer className="site-chrome border-t border-line bg-bg">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-2 px-6 py-7 font-mono text-xs uppercase tracking-[.06em] text-muted min-[900px]:flex-row min-[900px]:justify-between min-[900px]:px-10">
        <span>© {year} Oleksandr Bryksin</span>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-left uppercase transition-colors hover:text-ink"
        >
          {t('footer_top')}
        </button>
      </div>
    </footer>
  );
};

export default Footer;
