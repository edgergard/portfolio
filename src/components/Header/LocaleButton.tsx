import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { Locales } from "../../i18n";
import { LOCALE_STORAGES } from "../../utils/constants";

const LocaleButton = () => {
  const { i18n } = useTranslation();

  const handleClick = (locale: string) => {
    i18n.changeLanguage(locale);
    localStorage.setItem(LOCALE_STORAGES.LOCALE, locale);
  };

  return (
    <div
      className="flex gap-x-2 w-fit
      px-4 py-2 rounded-full font-semibold
      text-text-secondary bg-form-bg transition-all"
    >
      <button
        onClick={() => handleClick(Locales.EN)}
        className={classNames('hover:text-white transition-all', {
          "text-white": i18n.language === Locales.EN,
        })}
      >
        EN
      </button>

      <span className="text-white">|</span>

      <button
        onClick={() => handleClick(Locales.UA)}
        className={classNames('hover:text-white transition-all', {
          "text-white": i18n.language === Locales.UA,
        })}
      >
        UA
      </button>
    </div>
  );
};

export default LocaleButton;
