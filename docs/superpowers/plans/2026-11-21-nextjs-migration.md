# Next.js Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio as a fully static Next.js App Router site on Vercel. It must look and behave exactly like today's Vite site, with real per-language URLs, server-rendered HTML and less client JS.

**Architecture:**
- **Rendering:** every route under `src/app/[lang]/…` is statically generated for `en` and `uk`. Text and section shells are Server Components. Interactive parts (Wine shader, 3D knot, lens, form, toggles, videos, scrollbar) are client islands; three.js and the contact form load through `next/dynamic` with `ssr: false`.
- **Language routing:** a `proxy.ts` (Next 16 middleware) rewrites prefix-less URLs to `/en/...`, and redirects to `/uk/...` when the `lang` cookie says `uk`.
- **Theme:** an inline head script sets `data-theme` before paint.
- **Migration path:** the existing components move file by file into the new tree, and their tests move with them.

**Tech Stack:** Next.js 16 (latest stable; confirm at Task 1), React 19, TypeScript, Tailwind 3 (existing config), `motion` (successor of framer-motion), `@react-three/fiber` 9 + three 0.187, react-hook-form + zod, EmailJS browser SDK, react-toastify, `@vercel/speed-insights`, Vitest + RTL + jsdom.

**Spec:** `docs/superpowers/specs/2026-11-21-nextjs-migration-design.md`

## Global Constraints

- All work on branch `feat/nextjs`, cut from `main`. `main` and the GitHub Pages site stay untouched until the owner says "Merge and deploy" (Task 15).
- **Visual parity:** pixel-identical to today's site in dark and light, EN and UA, on home, archive and CV. The only approved visible change is that the CV opens in the web (text) view by default, with PDF via `?view=pdf`.
- **Theme:** dark by default. Light is `[data-theme='light']` on `<html>`, set before paint. No flash of the wrong theme or language, and no hydration warnings in dev mode.
- **Locales:** `en` (no URL prefix) and `uk` (`/uk`). Translation files stay `src/translations/en.json` and `ua.json` with unchanged keys. The `uk` locale reads `ua.json`.
- **Language cookie** `lang` = `en` | `uk`. There is no `Accept-Language` detection. With no cookie, the visitor gets English.
- **Routes:**
  - `/`, `/projects`, `/cv/react-native`, `/cv/frontend`, each also under `/uk`;
  - `/cv` and `/uk/cv` redirect to the `react-native` variant.
- **Site URL** comes from `NEXT_PUBLIC_SITE_URL` (a free `*.vercel.app` domain). There are no hard-coded absolute URLs except as the fallback in `src/lib/site.ts`.
- **EmailJS env vars:** `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_KEY` (renamed from `VITE_EMAILJS_*`).
- **Vercel:** Speed Insights on, Web Analytics off.
- **Library rules:**
  - Do not touch the internals of `wineShader.ts`, `renderer.ts`, `loop.ts`, `Knot.tsx` or `HeroScene.tsx`. Allowed edits are only `'use client'`, imports, and React 19 / R3F 9 API renames.
  - Tailwind stays on v3 with today's `tailwind.config.js` tokens and `styles.css`.
- **Commits:** every commit ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Windows Git Bash:** prefix CLI calls that take paths with `MSYS_NO_PATHCONV=1`.

## Review Focus

1. **Prefix-less URLs, `/en` and the cookie.** A visitor with `lang=uk` opens `/projects#all` and lands on `/uk/projects#all`, keeping the hash. An explicit `/en/...` URL redirects to the prefix-less URL, so there is no duplicate content. Covered by `resolveLocale` tests in Task 2.
2. **Switching language mid-page.** Pressing UA on `/cv/frontend?view=pdf#top` goes to `/uk/cv/frontend?view=pdf#top` and sets the cookie, so the next prefix-less visit stays Ukrainian. Covered by `switchLocaleHref` tests in Task 2 and the LocaleButton test in Task 4.
3. **Light theme on a static page.** A light-theme visitor sees light from the first paint on every route, including `not-found`, with no hydration warning. Covered by the theme-script test in Task 3 and the hydration sweep in Task 14.
4. **Unknown CV variant or locale.** `/cv/backend` and `/de` give the styled 404, not a crash or an English fallback. Covered by `dynamicParams = false` tests in Tasks 10 and 11.
5. **Old links.** `edgergard.github.io/portfolio/#/cv?v=frontend` with `locale=ua` lands on `<site>/uk/cv/frontend`, and `#/#contact` lands on `<site>/#contact`. Covered by `mapOldUrl` tests in Task 15.

---

## File structure (target)

```
src/app/
  layout.tsx                  root: <html>, fonts, theme script, SpeedInsights
  not-found.tsx               styled 404
  sitemap.ts, robots.ts
  [lang]/
    layout.tsx                I18nProvider, Header, Footer, PageScrollbar, Toast container
    page.tsx                  Home
    projects/page.tsx         Archive
    cv/page.tsx               redirect → cv/react-native
    cv/[variant]/page.tsx     CV
src/proxy.ts                  locale rewrite/redirect (calls lib/locale.ts)
src/lib/
  locale.ts                   LOCALES, Lang, resolveLocale, localeHref, switchLocaleHref
  dictionaries.ts             getDictionary(lang)
  i18n-client.tsx             I18nProvider, useT, useLang
  metadata.ts                 pageMetadata(lang, page, extra?)
  site.ts                     SITE_URL
  theme-script.ts             THEME_SCRIPT (string run in <head>)
src/components/…              existing components, moved and adapted
src/data, src/translations, src/images   unchanged locations
scripts/gh-pages-redirect/    index.html + 404.html + old-url map (Task 15)
next.config.ts, vitest.config.ts, vercel.json, eslint.config.mjs
```

---

### Task 1: Scaffold Next.js on `feat/nextjs`, keep tests running

**Files:**
- Create: `next.config.ts`, `vitest.config.ts`, `src/app/layout.tsx` (temporary minimal), `src/app/[lang]/page.tsx` (placeholder), `vercel.json`, `.env.example`
- Modify: `package.json`, `tsconfig.json`, `tailwind.config.js` (content globs), `vitest.setup.ts`, `.gitignore` (`.next/`, `next-env.d.ts`)
- Test: `src/test/scaffold.test.ts`

**Interfaces:**
- Produces:
  - `npm run dev|build|start|test|lint` scripts;
  - `vitest.config.ts` with `@vitejs/plugin-react`, the jsdom environment, `css.include: [/styles\.css/]` and the `@` alias to `src`;
  - Next-module mocks in `vitest.setup.ts`: `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`, `redirect`, `notFound`), `next/image` (renders an `<img>`), `next/font/local` (returns `{ variable, className }`) and `next/dynamic` (resolves the loader with React.lazy).

- [ ] **Step 1:** `git switch -c feat/nextjs main`.
- [ ] **Step 2: Write the failing test** `src/test/scaffold.test.ts`:
  - `package.json` scripts: `dev` is `next dev`, `build` is `next build`, `test` is `vitest run`;
  - dependencies include `next`, `react@^19`, `motion` and `@react-three/fiber@^9`;
  - `next.config.ts` contains `reactStrictMode: true` and does **not** contain `output: 'export'`;
  - `vercel.json` has an `ignoreCommand`.
- [ ] **Step 3:** Run `npx vitest run src/test/scaffold.test.ts`. Expected: FAIL.
- [ ] **Step 4:** Install dependencies:
  - add: `next@latest`, `react@19`, `react-dom@19`, `@types/react@19`, `@types/react-dom@19`, `motion`, `@react-three/fiber@9`, `@vercel/speed-insights`, `eslint-config-next`;
  - keep: three, react-hook-form, zod, @hookform/resolvers, @emailjs/browser, react-toastify, @heroicons/react, classnames, tailwind 3, vitest stack, sharp, ffmpeg-static;
  - do not remove the Vite or router packages yet (Task 12).

  Then write the files:
  - **`vercel.json`:** `ignoreCommand` set to `git show HEAD:package.json | grep -q '"next"' && exit 1 || exit 0`. This skips Vercel builds of any commit whose package.json has no Next.js, so `main` stays skipped until cut-over.
  - **`.env.example`:** the three `NEXT_PUBLIC_EMAILJS_*` names and `NEXT_PUBLIC_SITE_URL=https://<project>.vercel.app`.
- [ ] **Step 5:** Run `npx vitest run src/test/scaffold.test.ts`, then `npm run build`. Expected: PASS, and the build succeeds with the placeholder page.
- [ ] **Step 6:** Run `npm test`. Expected: the old suite still passes, because old files are untouched and the Vite tests run under the new `vitest.config.ts`. Fix the config, not the tests, until it does.
- [ ] **Step 7:** Commit: `chore(next): scaffold Next.js 16 alongside the Vite app`.

### Task 2: Locale core and proxy

**Files:**
- Create: `src/lib/locale.ts`, `src/lib/dictionaries.ts`, `src/lib/i18n-client.tsx`, `src/proxy.ts`
- Test: `src/lib/locale.test.ts`, `src/lib/i18n-client.test.tsx`

**Interfaces:**
- Produces:
  - `export const LOCALES = ['en', 'uk'] as const; export type Lang = typeof LOCALES[number]; export const DEFAULT_LANG: Lang = 'en'; export const LANG_COOKIE = 'lang';`
  - `isLang(v: unknown): v is Lang`
  - `localeHref(lang: Lang, path: string): string`. `('en','/cv/frontend')` gives `'/cv/frontend'`, `('uk','/')` gives `'/uk'`, and `('uk','/projects')` gives `'/uk/projects'`.
  - `switchLocaleHref(to: Lang, pathname: string, search: string, hash: string): string`. It strips any `/uk` prefix, applies `localeHref`, and appends search and hash.
  - `resolveLocale(pathname: string, cookie: string | undefined): { action: 'rewrite' | 'redirect' | 'next'; url: string }`.
  - `getDictionary(lang: Lang): Promise<Dictionary>`, with `Dictionary = Record<string, string>`. `uk` loads `ua.json`.
  - `<I18nProvider lang dict>`, `useT(): (key: string, vars?: Record<string, string | number>) => string`, and `useLang(): Lang`. `t` replaces `{{name}}` placeholders, the same format the current JSON uses (`{{count}}`, `{{from}}`, `{{to}}`). A missing key returns the key.

- [ ] **Step 1: Write the failing tests**:
  - `resolveLocale('/projects', undefined)` gives `{ action: 'rewrite', url: '/en/projects' }`.
  - `resolveLocale('/projects', 'uk')` gives `{ action: 'redirect', url: '/uk/projects' }`.
  - `resolveLocale('/uk/cv/frontend', 'en')` gives `{ action: 'next', url: '/uk/cv/frontend' }`. An explicit locale always wins.
  - `resolveLocale('/en/projects', undefined)` gives `{ action: 'redirect', url: '/projects' }`.
  - `resolveLocale('/', 'uk')` gives a redirect to `/uk`.
  - `switchLocaleHref('uk', '/cv/frontend', '?view=pdf', '#top')` gives `'/uk/cv/frontend?view=pdf#top'`.
  - `switchLocaleHref('en', '/uk', '', '#contact')` gives `'/#contact'`.
  - `useT()('projects_archive_title', { count: 6 })` under `<I18nProvider lang="en" dict={en}>` equals the EN string with 6 substituted.
  - `useT()('missing_key')` gives `'missing_key'`.
- [ ] **Step 2:** Run `npx vitest run src/lib`. Expected: FAIL.
- [ ] **Step 3:** Implement `locale.ts` and `dictionaries.ts` (dynamic `import()` of the JSON), `i18n-client.tsx` (context) and `proxy.ts`:
  - `proxy.ts` calls `resolveLocale(req.nextUrl.pathname, req.cookies.get(LANG_COOKIE)?.value)` and returns `NextResponse.rewrite` / `redirect` / `next`, keeping `search`. The hash never reaches the server, and browsers keep it across redirects.
  - The proxy matcher excludes `_next`, `api`, `favicon.svg`, `apple-touch-icon.png`, `og-image.jpg`, `robots.txt`, `sitemap.xml`, `fonts/`, `videos/`, `cv/*.pdf` and any path with a file extension.
- [ ] **Step 4:** Run `npx vitest run src/lib`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(next): locale routing core, dictionaries and client t()`.

### Task 3: Root layout, fonts and theme

**Files:**
- Create: `src/lib/theme-script.ts`, `src/lib/site.ts`
- Modify: `src/app/layout.tsx` (full), `src/theme.ts` (toggle also writes cookie `theme`), `styles.css` (remove the `@font-face` block, now from next/font), `tailwind.config.js` (`fontFamily.sans: ['var(--font-geist)', 'system-ui', 'sans-serif']`, `mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace']`)
- Test: `src/lib/theme-script.test.ts`; adapt `src/theme.test.tsx`; replace `src/test/fonts.test.ts`

**Interfaces:**
- Consumes: `Lang` from Task 2.
- Produces:
  - `THEME_SCRIPT: string` (IIFE). It reads `localStorage.theme`, else cookie `theme`, else `'dark'`, and sets `document.documentElement.dataset.theme`. Same rule as today's `index.html` script.
  - `SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oleksandr-bryksin.vercel.app'`.
  - Root layout props `{ children, params: Promise<{ lang?: string }> }`. It renders `<html lang={lang === 'uk' ? 'uk' : 'en'} data-theme="dark" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>`, with `<head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>` and `<SpeedInsights />` at the end of body.

- [ ] **Step 1: Write the failing tests**:
  - Running `new Function(THEME_SCRIPT)()` with `localStorage.theme = 'light'` gives `dataset.theme === 'light'`.
  - With nothing stored it gives `'dark'`.
  - With only `document.cookie = 'theme=light'` it gives `'light'`.
  - `useTheme().toggle()` writes both `localStorage.theme` and `document.cookie` containing `theme=light; path=/; max-age=31536000; samesite=lax`.
  - The layout source contains `next/font/local`, which loads `../../public/fonts/geist-latin.woff2` (with the latin-ext and cyrillic subsets as extra `src` entries, weight `'300 700'`) and the Geist Mono files (weight `'400 500'`), with `display: 'swap'`.
- [ ] **Step 2:** Run `npx vitest run src/lib/theme-script.test.ts src/theme.test.tsx src/test/fonts.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement the script, layout, fonts and cookie write. Global CSS is imported once in the root layout (`import '../../styles.css'`).
- [ ] **Step 4:** Run the same tests. Expected: PASS. Then run `npm run dev`, open `/` with `localStorage.theme='light'`, and confirm no flash and no hydration warning.
- [ ] **Step 5:** Commit: `feat(next): root layout with next/font Geist and pre-paint theme`.

### Task 4: Locale layout and site chrome (Header, Footer, scrollbar)

**Files:**
- Create: `src/app/[lang]/layout.tsx`
- Move and adapt:
  - `src/components/Header/*`: NavLink becomes `next/link` to `localeHref(lang, '/') + '#section'`; LocaleButton becomes a link from `switchLocaleHref` that also sets cookie `lang`; BurgerMenu and ThemeButton become `'use client'`.
  - `src/components/layout/Footer.tsx`: Server Component except the back-to-top button, which is a small client child.
  - `src/components/layout/PageScrollbar.tsx`: client.
- Test: adapt `src/components/layout/layout.test.tsx`, `PageScrollbar.test.tsx`, `footerYear.test.tsx`; new `src/components/Header/header.test.tsx`

**Interfaces:**
- Consumes: `getDictionary`, `I18nProvider`, `useT`, `useLang`, `localeHref`, `switchLocaleHref`, `LANG_COOKIE`.
- Produces:
  - `[lang]/layout.tsx` with `export const dynamicParams = false`, `generateStaticParams() → [{ lang: 'en' }, { lang: 'uk' }]` and `notFound()` for any other value.
  - It wraps children in `<I18nProvider lang dict>`, and renders Header, `<main className="min-h-screen bg-bg">`, Footer, `<ToastContainer />` and PageScrollbar, the same order as today's `App.tsx`.
  - `MotionConfig reducedMotion="user"` wraps the children (client wrapper `src/components/layout/MotionRoot.tsx`).

- [ ] **Step 1: Write the failing tests**:
  - Under `lang="uk"` with pathname `/uk`, the header nav "About" link has `href="/uk#about"`.
  - Under `en` it has `href="/#about"`.
  - Clicking EN↔UA on `/cv/frontend` (mock `usePathname` and `useSearchParams` returning `view=pdf`) navigates to `/uk/cv/frontend?view=pdf` and sets `document.cookie` with `lang=uk`.
  - `aria-pressed` reflects `useLang()`.
  - The existing layout, scrollbar and footer-year assertions still hold.
- [ ] **Step 2:** Run `npx vitest run src/components/Header src/components/layout`. Expected: FAIL.
- [ ] **Step 3:** Implement. Keep every className identical to today. Use `t()` from `useT` wherever `react-i18next` was used.
- [ ] **Step 4:** Run the same tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(next): [lang] layout with header, footer and scrollbar`.

### Task 5: Shared UI and Wine islands (React 19, R3F 9, motion)

**Files:**
- Move and adapt:
  - `src/components/ui/{Button,WineBadge,WineCanvas,ChunkBoundary}.tsx`;
  - `src/components/ui/wineButtons/{loop,renderer}.ts`;
  - `src/components/Wine/{WineSurface,WineCanvas}.tsx`;
  - `src/components/layout/{Section,Reveal}.tsx`;
  - `src/utils/clientValue.ts`.
- Delete: `src/components/ui/ReloadNotice.tsx` usage in routes (Next handles route chunks); keep `ChunkBoundary` for the lazy form and scene.
- Test: adapt `Button.test.tsx`, `loop.test.ts`, `wineSurface.test.tsx`, `chunkBoundary.test.tsx`, `src/test/motionStyles.test.ts`, `clientValue.test.tsx`

**Interfaces:**
- Produces:
  - `Button` keeps its props (`to`, `href`, `variant`, `size`). `to` now renders `next/link` and goes through `localeHref`, so callers pass a locale-free path.
  - `WineBadge` keeps `as` and `children`. Its text renders on the server, and only `<WineCanvas>` inside is client.
  - `Reveal` imports from `motion/react`.
  - `Section` is a Server Component.

- [ ] **Step 1:** Update the tests' imports for the new paths. Add an assertion that `Reveal`'s source imports from `'motion/react'`, and that `Section.tsx` has no `'use client'`.
- [ ] **Step 2:** Run `npx vitest run src/components/ui src/components/Wine src/test/motionStyles.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement:
  - add `'use client'` only where hooks or browser APIs are used;
  - make the R3F 9 changes: `Canvas` props and types (`ThreeElements`), and `useFrame`/`useThree` signatures as documented;
  - make the motion import swap.
- [ ] **Step 4:** Run the same tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(next): shared UI and wine islands on React 19 / R3F 9 / motion`.

### Task 6: Hero

**Files:**
- Move and adapt: `src/components/Hero/*`. `Hero.tsx` becomes a server shell; a client `HeroVisual.tsx` holds the fallback, `next/dynamic(() => import('./HeroScene'), { ssr: false })`, `SceneBoundary` and the fps caption.
- Test: adapt `hero.test.tsx`, `motion.test.ts`, `useHeroPointer.test.tsx`, `warmup.test.ts`, `wineTheme.test.ts`

**Interfaces:**
- Consumes: `Button` (`to="/#experience"`, `to="/cv/react-native"`), `useT`.
- Produces: the default export `Hero` (Server Component, receives `dict` strings through `useT` in its client children or as props).

- [ ] **Step 1:** Adapt the tests. Add an assertion that `renderToString(<Hero/>)` (inside the providers) contains `hero-wine-fallback`, both caption materials, and no `<canvas`.
- [ ] **Step 2:** Run `npx vitest run src/components/Hero`. Expected: FAIL.
- [ ] **Step 3:** Implement. The `View CV` button points to `/cv/react-native`, which replaces `/cv`.
- [ ] **Step 4:** Run the same tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(next): hero with server shell and dynamic 3D scene`.

### Task 7: Home sections: About, Experience, Certifications

**Files:**
- Move and adapt:
  - `src/components/About/*` (`SkillsList` client because of `useMagnify`; `About` and `SkillsBand` server);
  - `src/components/Experience/*` (the `details` stay native; `EducationCard` server);
  - `src/components/Certifications/*`.
- Create: `src/app/[lang]/page.tsx` (Home: Hero, About, Experience, Projects, Certifications, Contact; Projects and Contact are stubs until Tasks 8 and 9)
- Test: adapt `sections.test.tsx` (About, Experience, Certifications parts), `round6.test.tsx`, `experience.test.tsx`, `data/content.test.ts`

- [ ] **Step 1:** Adapt the tests to render the sections inside `<I18nProvider lang="en" dict={en}>`. Keep every assertion.
- [ ] **Step 2:** Run `npx vitest run src/components/About src/components/Experience src/components/Certifications src/components/sections.test.tsx src/components/round6.test.tsx`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the same tests. Expected: PASS. Then run `npm run build`: `/` and `/uk` appear as `○ (Static)`.
- [ ] **Step 5:** Commit: `feat(next): home page with about, experience and certifications`.

### Task 8: Projects section and archive page

**Files:**
- Move and adapt:
  - `src/components/Projects/*`: `ProjectMedia` client; posters use `next/image` with `fill` and `sizes="(min-width: 900px) 560px, 100vw"`; video poster stays a plain URL;
  - `src/pages/ArchivePage.tsx` → `src/app/[lang]/projects/page.tsx` plus a client `ArchiveFilters.tsx` for the pills and filtered rows.
- Test: adapt `projects.test.tsx`, `useInViewVideo.test.tsx`, `archive.test.tsx`, `data/projects.test.ts`

**Interfaces:**
- Produces: `projects/page.tsx` with `generateStaticParams` inherited from `[lang]`, and `export async function generateMetadata` (Task 11 fills it).

- [ ] **Step 1:** Adapt the tests:
  - the archive link `href` is `/projects` for `en` and `/uk/projects` for `uk`;
  - poster `<img>` elements come from the `next/image` mock with `sizes` set;
  - all existing order, frame, light-bar and divider assertions are kept.
- [ ] **Step 2:** Run `npx vitest run src/components/Projects src/pages/archive src/data`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the same tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(next): projects section and static archive page`.

### Task 9: Contact section and form

**Files:**
- Move and adapt:
  - `src/components/Contact/*`: `Contact` server; `CopyButton` client;
  - `LazyForm` client with `next/dynamic(() => import('./ContactForm'), { ssr: false, loading: FormPlaceholder })`, still mounted when near the viewport, inside `ChunkBoundary`.
- Modify: `ContactForm.tsx` reads the `process.env.NEXT_PUBLIC_EMAILJS_*` ids.
- Test: adapt the contact parts of `sections.test.tsx` and `round6.test.tsx` (they keep `intersectEverything()` from `src/test/intersect.ts`)

- [ ] **Step 1:** Adapt the tests. Add an assertion that `emailjs.sendForm` is called with `process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID` and the matching template and key values, stubbed with `vi.stubEnv`.
- [ ] **Step 2:** Run `npx vitest run src/components/sections.test.tsx src/components/round6.test.tsx`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the same tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(next): contact section with lazy EmailJS form`.

### Task 10: CV pages

**Files:**
- Create:
  - `src/app/[lang]/cv/page.tsx`: `redirect(localeHref(lang, '/cv/react-native'))`;
  - `src/app/[lang]/cv/[variant]/page.tsx`;
  - client `src/components/cv/CvViewSwitch.tsx`, which reads `?view` with `useSearchParams` and is wrapped in `<Suspense fallback={<CvWeb …/>}>`.
- Move and adapt:
  - `src/pages/cv/{CvWeb,CvPdf,Toggle,print.css}` → `src/components/cv/`;
  - the variant toggle becomes `next/link` to the other variant path, keeping `?view`;
  - `CvPdf`'s mobile/desktop choice becomes CSS-only: both layouts rendered, `hidden min-[900px]:block` and the reverse, so `matchMedia` goes away;
  - `useCvParams` is deleted.
- Test: adapt `src/pages/cv/cv.test.tsx` → `src/components/cv/cv.test.tsx`

**Interfaces:**
- Consumes: `getCv(variant, lang)` from `src/data/cvs.ts`. `isUa` already accepts `'uk'`.
- Produces:
  - `cv/[variant]/page.tsx` with `dynamicParams = false` and `generateStaticParams() → [{ variant: 'react-native' }, { variant: 'frontend' }]`;
  - the page server-renders `CvWeb` by default; `?view=pdf` swaps to `CvPdf` on the client.

- [ ] **Step 1: Write the failing tests**:
  - `generateStaticParams()` returns both variants;
  - the server render of `/cv/frontend` contains the frontend CV's headline text, so the web view is the default;
  - with `useSearchParams` mocked to `view=pdf`, the PDF `<object>` and the open-PDF link appear;
  - the variant toggle links are `/cv/react-native` and `/cv/frontend`, keeping `?view=pdf` when it is set;
  - an unknown variant is not in the static params (with `dynamicParams=false` that is a 404).
- [ ] **Step 2:** Run `npx vitest run src/components/cv`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the same tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(next): static CV pages per variant, web view by default`.

### Task 11: SEO: metadata, sitemap, robots, JSON-LD, 404

**Files:**
- Create: `src/lib/metadata.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/not-found.tsx`, `src/components/seo/PersonJsonLd.tsx`
- Modify: `generateMetadata` in `[lang]/page.tsx`, `projects/page.tsx` and `cv/[variant]/page.tsx`; add `metadataBase: new URL(SITE_URL)` in the root layout
- Test: `src/lib/metadata.test.ts`, `src/app/seo.test.ts` (replaces `src/test/seo.test.ts`)

**Interfaces:**
- Consumes: `SITE_URL`, `LOCALES`, `localeHref`, `getDictionary`.
- Produces: `pageMetadata(lang: Lang, page: 'home' | 'projects' | { cv: CvVariant }, dict: Dictionary): Metadata`, which returns:
  - `title` and `description`: home uses today's `<title>` and description; the others use dictionary keys `meta_projects_title`, `meta_projects_description`, `meta_cv_title`, `meta_cv_description`, added to both JSON files;
  - `alternates.canonical`, plus `alternates.languages` with `en`, `uk` and `x-default` (equal to the en URL);
  - `openGraph` with `url`, `siteName` ('Oleksandr Bryksin'), `locale` (`en_US` | `uk_UA`), `type: 'website'` and `images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt }]`;
  - `twitter` with `card: 'summary_large_image'`.

- [ ] **Step 1: Write the failing tests**:
  - `pageMetadata('uk', 'projects', ua).alternates.canonical` is `'/uk/projects'`;
  - `languages.en` is `'/projects'` and `languages['x-default']` is `'/projects'`;
  - `openGraph.images[0]` has width 1200;
  - `sitemap()` returns exactly 8 entries (home, projects, cv/react-native and cv/frontend, in both locales), each with `alternates.languages`; the `/cv` redirects are not listed;
  - `robots()` has `rules.allow: '/'` and `sitemap: `${SITE_URL}/sitemap.xml``;
  - the home page renders a `<script type="application/ld+json">` whose JSON has `@type: 'Person'`, `name: 'Oleksandr Bryksin'`, `jobTitle` and `sameAs` with the GitHub and LinkedIn URLs from `src/data/content.ts`;
  - `not-found.tsx` renders the site's heading style and a link home.
- [ ] **Step 2:** Run `npx vitest run src/lib/metadata.test.ts src/app/seo.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement, and add the four meta keys to `en.json` and `ua.json`.
- [ ] **Step 4:** Run the same tests. Expected: PASS. Then run `npm run build` and confirm `sitemap.xml` and `robots.txt` are listed as static.
- [ ] **Step 5:** Commit: `feat(next): per-page metadata, hreflang, sitemap, robots, JSON-LD, 404`.

### Task 12: Remove the Vite app

**Files:**
- Delete:
  - `index.html`, `vite.config.ts`, `tsconfig.node.json` (if unused);
  - `src/main.tsx`, `src/Root.tsx`, `src/App.tsx`, `src/entry-server.tsx`, `src/startup.ts`, `src/i18n.ts`;
  - `src/pages/` (now empty), `src/vite-env.d.ts`;
  - `scripts/prerender.mjs`;
  - tests: `entry-server.test.tsx`, `startup.test.ts`, `hydration.test.tsx` (replaced in Task 14), `src/test/{chunks,prepaint,prerenderScript,smoke}.test.ts*`.
- Modify:
  - `package.json`: remove `vite` (keep `@vitejs/plugin-react` for vitest), `react-router*`, `react-router-hash-link`, `@types/react-router-hash-link`, `i18next`, `react-i18next`, `framer-motion`, `gh-pages`, `@fontsource-variable/*`, and the `predeploy`/`deploy`/`preview` scripts;
  - add `eslint.config.mjs` with `next/core-web-vitals` and `next/typescript`, keeping today's style rules (max-len 100, padding lines).
- Test: `src/test/scaffold.test.ts` gets assertions that none of the removed packages appear in package.json, and that no file under `src/` imports `react-router`, `react-i18next` or `framer-motion`.

- [ ] **Step 1:** Add the assertions. Run `npx vitest run src/test/scaffold.test.ts`. Expected: FAIL.
- [ ] **Step 2:** Delete and uninstall. Fix any remaining imports.
- [ ] **Step 3:** Run `npm test`, `npm run lint` and `npm run build`. Expected: all pass; the build lists `/[lang]`, `/[lang]/projects` and `/[lang]/cv/[variant]` as SSG (●), and `/[lang]/cv` as a redirect.
- [ ] **Step 4:** Commit: `chore(next): remove the Vite app, router and i18next`.

### Task 13: Vercel project (owner) and the first preview

**Files:** none. Owner actions plus a note in `README.md`.

- [ ] **Step 1 (owner):**
  - create the Vercel project from the GitHub repo;
  - set Production Branch to `feat/nextjs` for the migration period (the `vercel.app` domain is new, so no live traffic is affected);
  - add env vars `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_KEY` (the values from the local `.env` used for `VITE_EMAILJS_*`) and `NEXT_PUBLIC_SITE_URL=https://<project>.vercel.app`;
  - enable Speed Insights; leave Web Analytics off.
- [ ] **Step 2:** Push `feat/nextjs`. Expected: the Vercel build succeeds. Record the URL in the ledger and in README.
- [ ] **Step 3:** Smoke-check the deployed URL:
  - `/`, `/uk`, `/projects`, `/uk/projects`, `/cv/react-native`, `/uk/cv/frontend`, `/cv` (redirect), `/de` (404), `/sitemap.xml` and `/robots.txt` all give the expected status;
  - with `curl -b 'lang=uk' -I <url>/projects` the response is a 307 to `/uk/projects`.
- [ ] **Step 4:** Commit README: `docs: Vercel preview and env vars`.

### Task 14: Parity, performance and hydration verification

**Files:**
- Create: `src/test/hydration.test.tsx` (dev-React hydration of each page's server render, for dark and light), `docs/perf/2026-11-21-nextjs.md`

- [ ] **Step 1: Write the test** `hydration.test.tsx`. For `en` and `uk` home, projects and `cv/frontend`, `renderToString` the page inside the providers, then `hydrateRoot` with `data-theme` set to dark and then to light. Expect no `console.error` matching `/did not match|hydrat/i`.
- [ ] **Step 2:** Run `npx vitest run src/test/hydration.test.tsx`. Expected: PASS. Fix the components if not.
- [ ] **Step 3: Visual parity.** Use the scratchpad screenshot tools (full page, scrolled through, reduced motion) to capture the old `main` build and the new Vercel preview for:
  - home in dark EN, light EN and dark UA;
  - the archive;
  - the CV (compare the old CV web view at `?view=web` with the new default).

  Pixel-diff the pairs. Report every difference outside the animated wine, knot and video regions, and fix it.
- [ ] **Step 4: Lighthouse.** Run mobile, 5 runs each, WebGL off and on, against the old build and the new preview. Record medians in `docs/perf/2026-11-21-nextjs.md`. Expected: FCP, LCP, TBT and JS bytes no worse than the old site, and first-load JS for `/` at or under 140 KB gzip (from `next build` output).
- [ ] **Step 5:** Run `npm run dev` and open every route in both themes and languages. Expected: zero hydration warnings in the console.
- [ ] **Step 6:** Commit: `test(next): hydration sweep, parity and performance results`.

### Task 15: Cut-over (only on the owner's "Merge and deploy")

**Files:**
- Create:
  - `scripts/gh-pages-redirect/index.html` and `404.html` (identical);
  - `scripts/gh-pages-redirect/map.js`, exporting `mapOldUrl(hash, locale, site)` and inlined into the HTML;
  - `scripts/deploy-gh-redirect.mjs`, which publishes that folder to the `gh-pages` branch with `gh-pages` run via npx;
  - `src/test/oldUrls.test.ts`.
- Modify: `next.config.ts` `redirects()`: `/portfolio` and `/portfolio/:path*` → `/:path*` (permanent), for anyone who reaches the Vercel domain with the old path.

**Interfaces:**
- Produces: `mapOldUrl(hash: string, locale: string | null, site: string): string`.

- [ ] **Step 1: Write the failing tests**. For `mapOldUrl`, with `site = 'https://x.vercel.app'`:
  - `('', null)` gives `site + '/'`;
  - `('#/cv', null)` gives `site + '/cv/react-native'`;
  - `('#/cv?v=frontend&view=pdf', 'ua')` gives `site + '/uk/cv/frontend?view=pdf'`;
  - `('#/projects', 'ua')` gives `site + '/uk/projects'`;
  - `('#/#contact', null)` gives `site + '/#contact'`;
  - `('#about', null)` gives `site + '/#about'`.
- [ ] **Step 2:** Run `npx vitest run src/test/oldUrls.test.ts`. Expected: FAIL. Implement, run again. Expected: PASS.
- [ ] **Step 3:** After the owner says "Merge and deploy":
  1. merge `feat/nextjs` into `main` (`--no-ff`) and run `npm test`, `npm run lint` and `npm run build` on `main`;
  2. push;
  3. the owner switches the Vercel Production Branch to `main`, and production redeploys;
  4. run `node scripts/deploy-gh-redirect.mjs`, so GitHub Pages now serves the redirect page.
- [ ] **Step 4: Verify live:**
  - the Vercel production URL serves the new site, matching Task 13 Step 3;
  - `https://edgergard.github.io/portfolio/#/cv?v=frontend` lands on `<site>/cv/frontend`;
  - `https://edgergard.github.io/portfolio/` lands on `<site>/`.
- [ ] **Step 5:**
  - remind the owner to update the site link in the CV PDFs, GitHub and LinkedIn profiles;
  - refresh the Telegram preview through @WebpageBot;
  - optionally submit the sitemap in Google Search Console.
- [ ] **Step 6:** Commit: `chore: cut over to Next.js on Vercel; GitHub Pages redirects`.
