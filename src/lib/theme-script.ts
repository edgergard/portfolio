/**
 * Runs in <head> before first paint: the visitor's saved choice (localStorage, then the `theme`
 * cookie), otherwise dark. The system colour scheme is ignored. Mirrors src/theme.ts.
 */
export const THEME_SCRIPT = `(function () {
  var t = null;
  try { t = localStorage.getItem('theme'); } catch (e) {}
  if (t !== 'light' && t !== 'dark') {
    var m = document.cookie.match(/(?:^|; )theme=(light|dark)(?:;|$)/);
    t = m ? m[1] : null;
  }
  document.documentElement.dataset.theme = t === 'light' ? 'light' : 'dark';
})();`;
