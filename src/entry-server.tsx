import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createPath, Router, type Navigator } from 'react-router-dom';
import i18n from './i18n';
import { AppRoutes } from './Root';

/**
 * The home page as HTML, built once at `npm run build` (scripts/prerender.mjs) and inlined into
 * index.html so the text shows before any script runs. Always English and dark: the browser
 * hydrates it only for English visitors on the home route (src/startup.ts), and the theme comes
 * from CSS variables set before first paint.
 */
/**
 * A static navigator whose links come out the way HashRouter writes them ("#/cv", "#/#contact"),
 * so the prerendered links stay inside /portfolio/ before the app takes over (and match it after).
 */
const hashNavigator: Navigator = {
  createHref: to => `#${typeof to === 'string' ? to : createPath(to)}`,
  go: () => {},
  push: () => {},
  replace: () => {},
};

export const render = () => {
  if (i18n.language !== 'en') {
    void i18n.changeLanguage('en');
  }

  return renderToString(
    <StrictMode>
      <Router location="/" navigator={hashNavigator} static>
        <AppRoutes />
      </Router>
    </StrictMode>,
  );
};
