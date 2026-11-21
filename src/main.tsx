import React from 'react';
import ReactDOM from 'react-dom/client';
import { Root } from './Root.tsx';
import './i18n.ts';
import { shouldHydrate } from './startup.ts';
import { LOCALE_STORAGES } from './utils/constants.tsx';

const container = document.getElementById('root')!;

const readLocale = () => {
  try {
    return window.localStorage.getItem(LOCALE_STORAGES.LOCALE);
  } catch {
    return null;
  }
};

const app = (
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

const hydrate = shouldHydrate({
  hash: window.location.hash,
  locale: readLocale(),
  hasMarkup: container.firstElementChild !== null,
});

if (hydrate) {
  ReactDOM.hydrateRoot(container, app);
} else {
  // Drop the prerendered English home page (or the dev placeholder comment) and render as before.
  container.textContent = '';
  ReactDOM.createRoot(container).render(app);
}
