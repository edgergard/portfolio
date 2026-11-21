type StartInput = {
  /** location.hash: HashRouter routes start with "#/", in-page section anchors do not. */
  hash: string;
  /** The saved language, or null when the visitor never picked one (English). */
  locale: string | null;
  /** Whether #root holds the prerendered home page HTML. */
  hasMarkup: boolean;
};

/**
 * Hydrate the prerendered HTML only when the first client render will match it: English, on the
 * home route. A Ukrainian visitor or a deep link (#/projects, #/cv) gets a fresh render instead,
 * so nobody sees the English home page flash first.
 */
export const shouldHydrate = ({ hash, locale, hasMarkup }: StartInput) => {
  const home = hash === '' || hash === '#/' || !hash.startsWith('#/');
  const english = locale === null || locale === 'en';

  return hasMarkup && home && english;
};
