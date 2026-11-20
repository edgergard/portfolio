import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Locales } from '../../i18n';
import { LOCALE_STORAGES } from '../../utils/constants';

const LOCALES = [
  { value: Locales.EN, label: 'EN' },
  { value: Locales.UA, label: 'UA' },
];

const LocaleButton = () => {
  const { i18n } = useTranslation();

  const handleClick = (locale: string) => {
    i18n.changeLanguage(locale);
    localStorage.setItem(LOCALE_STORAGES.LOCALE, locale);
  };

  return (
    <div className="flex w-fit items-center gap-x-2">
      {LOCALES.map(({ value, label }, i) => (
        <span key={value} className="flex items-center gap-x-2">
          {i > 0 && <span className="text-[#55555B]">/</span>}
          <button
            type="button"
            onClick={() => handleClick(value)}
            aria-pressed={i18n.language === value}
            className={classNames('uppercase transition-colors hover:text-ink', {
              'text-ink': i18n.language === value,
              'text-muted-2': i18n.language !== value,
            })}
          >
            {label}
          </button>
        </span>
      ))}
    </div>
  );
};

export default LocaleButton;
