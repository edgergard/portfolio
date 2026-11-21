import { useTranslation } from 'react-i18next';

/** Shown when a page's code failed to load (usually a new version was just published). */
const ReloadNotice = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col items-start gap-4 px-6 py-24 min-[900px]:px-10">
      <p className="text-lg text-ink-2">{t('chunk_failed')}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-full border border-rule px-5 py-2 font-mono text-xs uppercase tracking-[.06em] text-ink hover:border-ink"
      >
        {t('chunk_reload')}
      </button>
    </div>
  );
};

export default ReloadNotice;
