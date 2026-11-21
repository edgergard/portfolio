# Fast loading — design

**Date:** 2026-11-21 · **Status:** draft for approval

## Why

The owner wants the portfolio to open faster. The site must look exactly the same afterwards (pixel for pixel, both themes). Success = a better Lighthouse mobile score / LCP / transferred bytes, measured before and after on the same build setup.

## Goals

- Less JS, CSS, font and image weight on the first visit to the home page.
- Meaningful HTML (hero text and sections) visible before any JS runs.
- Nothing visual changes. No content changes.

## Non-goals and anti-goals

- No changes to the Wine shader or the 3D knot code (that was option B, not chosen).
- No move away from HashRouter or GitHub Pages.
- A failure even if it is faster: a flash of different content or theme on load, broken language or theme switching, hydration errors in the console, or the UA visitor seeing an EN page first.

## Approaches considered

- **A. Quick wins.** Smaller images, split code, self-hosted fonts. Chosen.
- **B. Drop three.js from the Wine renderers.** Not chosen for now; revisit after measuring.
- **C. Prerender the home page HTML at build.** Chosen together with A.

## Design

### A1. Images

- Convert the project posters (`src/images/*`) to AVIF with a WebP fallback, at most 2× their largest displayed size.
- Commit the converted files and serve them through `<picture>`, or WebP only if the markup stays simpler.
- Keep the originals out of the bundle.
- Keep the `loading="lazy"` that is already there.

### A2. Code splitting

- `ArchivePage` and `CvPage` become `React.lazy` routes.
- The contact form (react-hook-form, zod, emailjs, toastify) loads on demand, when the Contact section nears the viewport.
- Vendor libraries go into their own long-lived chunk (react, react-dom, router, i18n, framer-motion), so a deploy that only changes app code keeps them cached.

### A3. Fonts

- Self-host Geist and Geist Mono as woff2 subsets (latin and cyrillic), with the same weights as today.
- `<link rel="preload">` the two files the first screen uses.
- Remove the Google Fonts requests.

### C. Prerender the home page

- At build time, render `/` (the home route) to HTML with React's server renderer and inline it into `dist/index.html` inside `#root`.
  - Language: EN. Theme: dark.
  - A server entry uses `MemoryRouter` in place of `HashRouter`.
- On the client:
  - When the visitor lands on the home route with EN stored (or nothing stored), call `hydrateRoot`.
  - Otherwise (UA, `#/projects`, `#/cv`), discard the prerendered markup and `createRoot` as today. This avoids the "UA visitor sees EN first" failure. The pre-paint theme script already sets the theme before paint.
- Browser-only reads during the first render (theme, localStorage, `window`, matchMedia) must return the server value on the first client render and update after mount. Use `useSyncExternalStore` with a server snapshot of `dark`, so a light-theme visitor hydrates cleanly and then switches. The theme only affects colours that come from CSS variables, apart from a few theme-aware strings and gradients in Hero.
- WebGL and lazy chunks (HeroScene, WineCanvas) render their existing CSS fallback on the server. The shader takes over after load, as it does today.
- Above-the-fold content must not be prerendered at opacity 0. Reveal's `initial` hidden state applies only to sections below the hero; the hero stays visible in the HTML.

## Builder's calls

- The exact image tool (sharp script versus vite-imagetools).
- The chunk naming.
- The prerender mechanics (a small Node script after `vite build --ssr`, or a plugin).

## Verification

- Lighthouse mobile before and after on the local production preview, with the numbers reported.
- Full test suite and lint pass.
- Screenshot comparison of home (dark and light, EN and UA), archive and CV, before and after.
- No hydration warnings in the console.
