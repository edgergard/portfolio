import type { Lang } from './locale';

export type Dictionary = Record<string, string>;

const loaders: Record<Lang, () => Promise<Dictionary>> = {
  en: () => import('@/translations/en.json').then((m) => m.default),
  uk: () => import('@/translations/ua.json').then((m) => m.default),
};

export function getDictionary(lang: Lang): Promise<Dictionary> {
  return loaders[lang]();
}
