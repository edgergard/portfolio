/** The browser UI colour (iOS/Android status bar, address bar) per theme: the header background. */
export const THEME_COLORS = { dark: '#0a0a0b', light: '#faf7f5' } as const;

/**
 * Runs in <head> before first paint: the visitor's saved choice (localStorage, then the `theme`
 * cookie), otherwise dark. The system colour scheme is ignored. Mirrors src/theme.ts, including
 * the theme-color meta (THEME_COLORS) that tints the phone's status bar to match the header.
 */
export const THEME_SCRIPT = `(function () {
  var t = null;
  try { t = localStorage.getItem('theme'); } catch (e) {}
  if (t !== 'light' && t !== 'dark') {
    var m = document.cookie.match(/(?:^|; )theme=(light|dark)(?:;|$)/);
    t = m ? m[1] : null;
  }
  document.documentElement.dataset.theme = t === 'light' ? 'light' : 'dark';
  var c = document.querySelector('meta[name="theme-color"]');
  if (c && t === 'light') c.setAttribute('content', '${THEME_COLORS.light}');
})();`;

/**
 * Runs in the global 404's <head> before first paint: Ukrainian under /uk, English elsewhere.
 * styles.css shows only the matching copy (.nf-en / .nf-uk).
 */
export const NOT_FOUND_LANG_SCRIPT
  = "document.documentElement.lang = location.pathname === '/uk' || location.pathname.startsWith('/uk/') ? 'uk' : 'en';";
