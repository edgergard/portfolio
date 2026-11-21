import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { EN, UA } from './translations';
import { LOCALE_STORAGES } from "./utils/constants";

export enum Locales {
  EN = "en",
  UA = "ua",
}

const resources = {
  en: {
    translation: EN
  },
  ua: {
    translation: UA
  },
};

// No storage while the home page is prerendered at build: that HTML is always English.
const locale = (typeof localStorage === 'undefined' ? null : localStorage.getItem(LOCALE_STORAGES.LOCALE))
  || Locales.EN;

const syncHtmlLang = (lng: string) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.lang = lng === Locales.UA ? 'uk' : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: locale,
  });

syncHtmlLang(i18n.language);
i18n.on('languageChanged', syncHtmlLang);

export default i18n;