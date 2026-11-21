# Next.js migration — design

**Date:** 2026-11-21 · **Status:** approved by the owner 2026-11-21 · **Branch:** `feat/nextjs` (separate from `main` until cut-over)

## Why

The owner wants the portfolio rewritten on Next.js for three reasons:
- **Optimisation and speed.** Real HTML for every page and language, less JS shipped to the browser, built-in font and image optimisation.
- **SEO.** Real URLs instead of `#/` routes, one indexable page per language, sitemap, `hreflang`, metadata per page.
- **A move to Vercel** from GitHub Pages.

## Goals

- The same site, pixel for pixel, in dark and light themes and in EN and UA:
  - home: hero, About, Experience, Projects, Certifications, Contact;
  - the projects archive;
  - the CV page.
  - All existing behaviour carries over: Wine shader, 3D knot, Core stack lens, reveal animations, contact form, theme and language switch, custom scrollbar, demo videos.
- Every page is statically generated at build (SSG) and served from Vercel's CDN.
- Lighthouse mobile is better than the current Vite site measured on the same setup (baseline in `docs/perf/2026-11-21-after.md`): lower FCP, LCP, TBT and JS bytes.
- Search and preview ready:
  - unique title, description and Open Graph per page and language;
  - `hreflang` alternates;
  - `sitemap.xml` and `robots.txt`;
  - canonical URLs.
- Old links keep working: `edgergard.github.io/portfolio/…` (including `#/cv` and `#/projects`) lands on the matching new page.

## Non-goals

- No redesign and no new content. Copy, data and visuals stay as they are.
- No server-side rendering per request, no database, no CMS.
- No rewrite of the Wine shader or knot internals (they move as client components, logic untouched).
- No Tailwind 4 move: Tailwind 3 stays, to avoid visual drift.

## Anti-goals

The migration has failed, even if it technically works, if any of these happen:
- Any visible difference from today's site that the owner did not ask for.
- A flash of the wrong theme or wrong language on load.
- Hydration warnings in the console.
- Worse Lighthouse numbers than the Vite site.
- `main` or the live GitHub Pages site breaking before cut-over.
- Lost features: the contact form not sending, videos not playing, the CV PDF not opening.

## Approaches considered

- **A. App Router, fully static (SSG), client islands only where needed.** Chosen. The content changes only on deploy, so static generation gives the fastest result at zero server cost.
- **B. App Router with SSR or ISR.** Not chosen. It brings no benefit for static content, and adds per-request compute and cold starts.
- **C. Pages Router.** Not chosen. It is legacy and has no Server Components, so it ships more JS.
- **Migration style:** a separate branch `feat/nextjs` in this repo, chosen by the owner. Sections are ported one at a time and tests adapted. `main` and GitHub Pages stay live until the cut-over.

## Design

### Stack

- **Next.js:** latest stable (16.x at time of writing; the builder checks the current version) with the App Router, React 19 and TypeScript.
- **Libraries that have to change** (the builder confirms each against current docs):
  - `@react-three/fiber` v8 → v9, which React 19 requires;
  - `framer-motion` → `motion`;
  - `@testing-library/react` stays at 16.
- **Libraries that stay:** Tailwind 3 with the existing `tailwind.config.js`, tokens and `styles.css`.
- **Libraries that go:**
  - `react-router`, `react-router-dom` and `react-router-hash-link`, replaced by Next routing, `next/link` and plain section anchors;
  - `i18next` and `react-i18next` (see below);
  - the Vite-only files: `vite.config.ts`, `index.html`, `entry-server.tsx`, `startup.ts`, `main.tsx`, `scripts/prerender.mjs`, `gh-pages`.
- **Tests:** Vitest + RTL + jsdom stay, with the Vite React plugin kept for tests only. Next-specific modules (`next/navigation`, `next/image`, `next/font`) are mocked in `vitest.setup.ts`.
- **Contact form:** EmailJS stays, sent from the browser as today. *Builder's call, see the end of this document.*

### Routes (all static)

| URL | Page |
|---|---|
| `/` | Home, English |
| `/uk` | Home, Ukrainian |
| `/projects`, `/uk/projects` | Archive |
| `/cv/react-native`, `/cv/frontend`, `/uk/cv/react-native`, `/uk/cv/frontend` | CV, one static page per variant |
| `/cv`, `/uk/cv` | Redirect to the React Native variant |

The CV page renders the web view by default (owner decision 3); `?view=pdf` switches to the PDF on the client.

- **Locales:** English sits at the root and Ukrainian under `/uk`. The folder is `app/[lang]/…` with `generateStaticParams` returning `en` and `uk`. Middleware (`proxy.ts` on Next 16) maps `/` to the English segment internally (a rewrite, not a redirect), so English URLs have no prefix.
- **Sections:** in-page anchors stay `/#about`, `/#projects` and so on, with smooth scroll via CSS `scroll-behavior` and `scroll-margin`.
- **CV variant and view:**
  - Today the CV variant is a query param (`?v=`). It becomes a path segment, so each variant is its own static, indexable page.
  - The web/PDF view toggle stays a client-side query param (`?view=web`), read with `useSearchParams` inside a Suspense boundary. The page stays static.
- **404:** `app/not-found.tsx` in the site's style.
- **Old URLs:**
  - On Vercel, `next.config` redirects cover `/portfolio/*` paths.
  - On GitHub Pages after cut-over, a tiny static page (replacing the old deploy) maps hash routes to the new domain: `#/cv` → `/cv/react-native`, `#/projects` → `/projects`, and `#/#section` → `/#section`. It also keeps the language when `localStorage` key `locale` is `ua`, and maps `#/cv?v=frontend` to `/cv/frontend`.

### Language

- Dictionaries come from the existing `src/translations/en.json` and `ua.json`, with keys unchanged.
  - `getDictionary(lang)` loads them in Server Components.
  - Client islands get the strings they need as props, or through a small `I18nProvider` with a `t()` that has the same signature as today, so components change little.
- The locale switch is a link to the same page in the other language, keeping the hash. The choice is also saved in a `lang` cookie: no client-side language state, no flash.
- `<html lang>` is set per locale in the root layout.
- Metadata is localised.

### Theme

- Dark stays the default. The light theme stays `[data-theme='light']` on `<html>`.
- The choice is stored in a cookie **and** localStorage.
- A tiny inline script in the root layout `<head>` (`next/script` with `strategy="beforeInteractive"`, or a raw `<script>` in the layout) sets `data-theme` before paint. This is the same logic as today's `index.html`.
- `<html suppressHydrationWarning>` covers that attribute only.
- Theme-dependent markup stays CSS-driven, as on the branch just shipped: the hero fallback gradient, the caption material and the toggle icons. So the static HTML is right for both themes.
- `useCurrentTheme` keeps its `useSyncExternalStore` shape, with dark as the server value, for the 3D material and the wine renderer.

### Server and client split

**Server Components** (no JS shipped):
- Section shells and all text: Section, Heading, About text, the Experience timeline content, the Certifications text, the Contact rows;
- the Footer and the archive table markup;
- the CV web view content.

**Client components** (`'use client'`):
- Hero: the WebGL scene, WineBackdrop, the knot, the pointer hook and the fps caption;
- WineSurface/WineCanvas and the shared wine button loop/renderer;
- WineBadge and Button: they use the wine canvas. `WineBadge` renders its text on the server and only the canvas layer is a client island;
- `SkillsList` with magnify (the lens);
- `Reveal` (motion);
- `ProjectMedia`: video in view, `useInViewVideo`;
- `ContactForm` (lazy, when near the viewport), `CopyButton` and toasts;
- Header controls: ThemeButton, LocaleButton, BurgerMenu, active nav state;
- `PageScrollbar`;
- the CV Toggle and the PDF/web view switch;
- the archive filter pills.

**Heavy islands:**
- `next/dynamic` with `ssr: false` for HeroScene/three, with the existing CSS fallback rendered on the server.
- `next/dynamic` with `ssr: false` for the contact form.
- Today's `ChunkBoundary` error boundaries carry over.

### Assets and performance

- **Fonts:** `next/font/local` with the self-hosted Geist and Geist Mono woff2 files already in `public/fonts` (or the `geist` package if identical), exposed as CSS variables in the Tailwind font families. `font-display: swap`, preloaded automatically.
- **Images:** project posters use `next/image` with `sizes`, so Vercel serves AVIF or WebP per device. Video posters stay plain files under `public/videos`.
- **Videos:** stay in `public/videos`, `preload="none"`, played in view.
- **three.js:** only in the dynamically imported HeroScene and wine renderer chunks, never in the first-load JS.
- **Budget:** first-load JS of the home route at most the current Vite entry (index + vendor ≈ 140 KB gzip), aiming lower. Checked against `next build` output.
- **Vercel:** `@vercel/speed-insights` on; Web Analytics off (owner decision 4).

### SEO

- **Metadata API**, in `generateMetadata` per page and language:
  - title and description from the dictionaries;
  - canonical URL;
  - `alternates.languages` (en, uk, x-default);
  - Open Graph and Twitter tags.
- **Open Graph image:** the existing `public/og-image.jpg` for all pages; later per-page images if wanted.
- **`app/sitemap.ts`:** every static URL in both languages, with alternates.
- **`app/robots.ts`:** allow all, with the sitemap URL.
- **JSON-LD:** a `Person` schema (name, job title, sameAs: GitHub, LinkedIn) on the home page.
- **`metadataBase`:** from an env var `NEXT_PUBLIC_SITE_URL` (the Vercel domain or a custom domain later).

### Hosting and cut-over

- **Before cut-over:** a Vercel project linked to the repo. Every push to `feat/nextjs` gets a preview URL, so the owner can review on real URLs while the old site keeps running.
  - The owner links the Vercel project and adds the EmailJS ids as `NEXT_PUBLIC_EMAILJS_*` env vars. Claude cannot create accounts or enter keys; until then the preview's contact form cannot send.
  - Production builds of `main` (still the Vite app) are skipped until cut-over with an Ignored Build Step set in the Vercel project settings (not `vercel.json`, which `main` does not carry). *Builder's call.*
- **Cut-over:**
  1. merge `feat/nextjs` into `main`, on the owner's "Merge and deploy";
  2. Vercel deploys production;
  3. the GitHub Pages deploy is replaced by the redirect page;
  4. links in the CV PDFs and on profiles get updated later by the owner, if the domain changes.

### Testing and verification

- **Port the existing 271 tests by area.** Rules for adapting them:
  - router tests become route and metadata tests;
  - i18n tests use the dictionary provider;
  - the prerender and startup tests are deleted with their code;
  - each section's tests move with the section.
- **New tests:**
  - `generateStaticParams` covers every locale and CV variant;
  - metadata per page includes the canonical, alternates and OG image;
  - the sitemap lists every URL;
  - the old-hash redirect map;
  - the theme script sets `data-theme` before paint.
- **Visual:** full-page screenshots of the old site against the new preview for home (dark, light, EN, UA), the archive and the CV, compared with the existing scratchpad tools. Differences only in animated regions.
- **Performance:** Lighthouse mobile, five runs each, WebGL on and off, old against new, recorded in `docs/perf/`.
- **Console:** no hydration warnings in dev mode across all pages.

## Owner decisions (2026-11-21)

1. **Domain:** the free `*.vercel.app` domain. The exact subdomain comes from the Vercel project name and is read from `NEXT_PUBLIC_SITE_URL`.
2. **Returning Ukrainian visitors:** the language choice is stored in a `lang` cookie (`en` or `uk`).
   - The proxy redirects prefix-less URLs to `/uk/...` when the cookie says `uk`.
   - With no cookie (crawlers, first visits) the visitor gets English, as today. There is no `Accept-Language` detection.
   - Visitors who picked Ukrainian on the old site see English once and switch; no client-side carry-over script, so there is no language flash.
3. **CV page:** the web (text) view becomes the default and is server-rendered into the static HTML. PDF stays one click away (`?view=pdf`). This is the one visible change the owner approved.
4. **Vercel:** Speed Insights on, Web Analytics off.
5. **GitHub Pages:** after cut-over, the old site is replaced by a redirect page that sends every old URL to the matching new page.

## Builder's calls

- Server/client boundaries at component level, within the split above.
- Mocks for Next modules in tests.
- Exact middleware/proxy mechanics for the prefix-less English locale.
- Whether `I18nProvider` or props carry strings to client islands.
- Keeping EmailJS client-side. Moving to a Route Handler with Resend would hide the EmailJS ids but needs an API key and a server function, which is outside "fully static".
