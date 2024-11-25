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

const locale = localStorage.getItem(LOCALE_STORAGES.LOCALE) || Locales.EN;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: locale,
  });

export default i18n;