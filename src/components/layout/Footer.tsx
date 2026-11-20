import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="site-chrome bg-bg">
      <div className="mx-auto flex max-w-[1280px] flex-col border-t border-line gap-2 px-6 py-7 font-mono text-xs uppercase tracking-[.06em] text-muted min-[900px]:flex-row min-[900px]:justify-between min-[900px]:px-10">
        <span>© 2026 Oleksandr Bryksin</span>
        <span>{t('footer_built')}</span>
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
