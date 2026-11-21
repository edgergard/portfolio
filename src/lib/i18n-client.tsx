'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { Dictionary } from './dictionaries';
import type { Lang } from './locale';

type TFunction = (key: string, vars?: Record<string, string | number>) => string;

type I18nValue = { lang: Lang; t: TFunction };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  lang,
  dict,
  children,
}: {
  lang: Lang;
  dict: Dictionary;
  children: ReactNode;
}) {
  const t = useCallback<TFunction>(
    (key, vars) => {
      const template = dict[key] ?? key;

      if (!vars) {
        return template;
      }

      return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
        name in vars ? String(vars[name]) : match,
      );
    },
    [dict],
  );
  const value = useMemo(() => ({ lang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);

  if (!ctx) {
    throw new Error('useT/useLang must be used inside <I18nProvider>');
  }

  return ctx;
}

export function useT(): TFunction {
  return useI18n().t;
}

export function useLang(): Lang {
  return useI18n().lang;
}


/** A translated string, for Server Components that render text from the dictionary. */
export function T({ k }: { k: string }) {
  return useT()(k);
}
