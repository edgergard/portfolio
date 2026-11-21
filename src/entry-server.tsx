import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import i18n from './i18n';
import { AppRoutes } from './Root';

/**
 * The home page as HTML, built once at `npm run build` (scripts/prerender.mjs) and inlined into
 * index.html so the text shows before any script runs. Always English and dark: the browser
 * hydrates it only for English visitors on the home route (src/startup.ts), and the theme comes
 * from CSS variables set before first paint.
 */
export const render = () => {
  if (i18n.language !== 'en') {
    void i18n.changeLanguage('en');
  }

  return renderToString(
    <StrictMode>
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    </StrictMode>,
  );
};
