// Vite-era route shim, removed in Task 12: the old router lazy-loads the Next.js archive page,
// which reads the I18nProvider that the Vite shell feeds through I18nextBridge.
export { default } from '../app/[lang]/projects/page';
