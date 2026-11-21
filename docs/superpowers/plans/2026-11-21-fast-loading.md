# Fast Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the home page load faster:
- lighter images;
- code splitting;
- self-hosted fonts;
- home HTML prerendered at build.

The site must look exactly the same.

**Architecture:**
- **Assets:** project posters are pre-converted to WebP and committed. Vite `manualChunks` splits the vendor code. `React.lazy` loads the archive page, the CV page and the contact form. Geist woff2 files live in `public/fonts`.
- **Prerender:** a server entry (`src/entry-server.tsx`) renders the home route with `MemoryRouter` to a string. A Node script injects that string into `dist/index.html`.
- **Client start:** the client hydrates only when the visitor is on the home route with EN; otherwise it renders fresh.

**Tech Stack:** Vite 5, React 18 (`react-dom/server`, `hydrateRoot`), sharp (dev only), Vitest.

**Spec:** `docs/superpowers/specs/2026-11-21-fast-loading-design.md`

## Global Constraints

- Nothing visual changes: pixel-identical in dark and light, EN and UA, on home, `#/projects` and `#/cv`.
- Dark theme by default. The pre-paint theme script in `index.html` stays.
- The prerendered HTML is EN plus dark. A UA visitor, or a deep link to `#/projects` or `#/cv`, never sees it; those cases use `createRoot`.
- No hydration warnings in the console.
- Do not touch the Wine shader or knot code (`wineShader.ts`, `renderer.ts`, `loop.ts`, `Knot.tsx`, `HeroScene.tsx`).
- Deploy base is `/portfolio/` and stays HashRouter.
- Work on branch `feat/fast-loading`. Do not merge or deploy without the owner's explicit "Merge and deploy".
- Windows Git Bash: prefix vite and node CLI calls that take paths with `MSYS_NO_PATHCONV=1`.
- Every commit ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Light-theme visitor on home:** hydrates with no mismatch warning, then shows light colours with no visible flash. Task 5 has a test for this: the theme hook returns `dark` from the server snapshot.
2. **UA visitor on home:** never sees EN text. Task 6 tests `shouldHydrate` with `locale: 'ua'` → false.
3. **Deep link `#/cv`:** renders the CV, not a hydrated home. Task 6 tests `shouldHydrate` with `hash: '#/cv'` → false.
4. **Hero visible in the HTML before JS runs:** no `opacity:0` on the hero. Task 7 has a test on the server output.
5. **Opening `#/projects` from the home page** (lazy route): shows the archive after the chunk loads, with no blank crash. Task 3 covers it with a findBy test.

---

### Task 1: Baseline measurement

**Files:**
- Create: `docs/perf/2026-11-21-baseline.md`

- [ ] **Step 1:** Build with `npm run build`, then serve it with `npx vite preview --base=/portfolio/ --port 4190 --strictPort` in the background.
- [ ] **Step 2:** Run Lighthouse mobile three times: `npx lighthouse http://localhost:4190/portfolio/ --form-factor=mobile --only-categories=performance --output=json --quiet --chrome-flags="--headless"`.
- [ ] **Step 3:** Record the median Performance score, FCP, LCP, TBT, total transferred KB and JS KB in the baseline file.
- [ ] **Step 4:** Capture the before screenshots into the scratchpad: home dark EN, home light EN, home dark UA, `#/projects`, `#/cv`. Use the existing scratchpad tools (`cdpshot2.mjs` and `lshot.mjs`), or a fresh CDP script.
- [ ] **Step 5:** Commit: `perf: record loading baseline`.

### Task 2: Lighter project images

**Files:**
- Create: `scripts/optimize-images.mjs`
- Modify: `src/images/index.ts`, `package.json` (add `sharp` to devDependencies)
- Replace: the `src/images/*.png` posters with `.webp` files; delete the old PNGs.

**Interfaces:** `src/images/index.ts` keeps its export names, so no consumer changes.

- [ ] **Step 1:** Write `scripts/optimize-images.mjs` with these rules:
  - each source in `src/images` becomes WebP;
  - width capped at 1200px;
  - quality 82;
  - output written next to the source;
  - `B&Q.webp` is re-encoded with the same cap.
- [ ] **Step 2:** Run it, then switch the imports in `src/images/index.ts` to the `.webp` files and delete the PNGs.
- [ ] **Step 3:** Check that every file in `src/images` is under 150 KB with `ls -la src/images`.
- [ ] **Step 4:** Run `npm test` and `npm run lint`. Both pass.
- [ ] **Step 5:** Commit: `perf(images): project posters as capped WebP`.

### Task 3: Code splitting

**Files:**
- Modify: `src/Root.tsx`, `src/components/Contact/Contact.tsx`, `vite.config.ts`
- Tests: `src/pages/archive/archive.test.tsx`, `src/pages/cv/cv.test.tsx`, `src/test/smoke.test.tsx` (switch to `findBy` wherever a route renders)

- [ ] **Step 1:** Write the failing test in `src/test/chunks.test.ts`. It builds nothing: it reads `vite.config.ts` as raw text and checks that `manualChunks` names a `vendor` chunk containing `react-dom`. Run it and confirm it fails.
- [ ] **Step 2:** In `vite.config.ts`, set `build.rollupOptions.output.manualChunks(id)`:
  - return `'vendor'` for ids under `node_modules` matching react, react-dom, scheduler, react-router, @remix-run, i18next, react-i18next or framer-motion;
  - return undefined for everything else.
- [ ] **Step 3:** In `Root.tsx`, make `ArchivePage` and `CvPage` `React.lazy` routes, each wrapped in `<Suspense fallback={null}>`.
- [ ] **Step 4:** In `Contact.tsx`, change `ContactForm` to `lazy(() => import('./ContactForm'))` inside `<Suspense>`. The fallback is an empty div with the same GLASS classes and `min-h` matching the form's height, so nothing jumps.
- [ ] **Step 5:** Update the route tests to use `await screen.findBy…` (timeout 8000). Run `npm test` and `npm run lint`; both pass.
- [ ] **Step 6:** Build and confirm the output contains `vendor-*.js`, `ArchivePage-*.js`, `CvPage-*.js` and `ContactForm-*.js`, and that the `index-*.js` chunk is smaller than the baseline.
- [ ] **Step 7:** Commit: `perf: lazy archive, CV and contact form; vendor chunk`.

### Task 4: Self-hosted fonts

**Files:**
- Create: `public/fonts/` (woff2 files)
- Modify: `index.html`, `styles.css` (add `@font-face` at the top, before the theme blocks)
- Test: `src/test/fonts.test.ts`

- [ ] **Step 1:** Write the failing test `src/test/fonts.test.ts`. It imports `index.html?raw` and `styles.css?raw`.
  - `index.html` does not contain `fonts.googleapis.com`.
  - `index.html` has `<link rel="preload" … as="font" type="font/woff2" crossorigin>` for `fonts/geist-latin.woff2`.
  - `styles.css` has `@font-face` rules for `'Geist'` and `'Geist Mono'`, both with `font-display: swap`.
- [ ] **Step 2:** Get the variable woff2 files from `@fontsource-variable/geist` and `@fontsource-variable/geist-mono`. Install them as dev dependencies and copy the files into `public/fonts/` as:
  - `geist-latin.woff2`, `geist-cyrillic.woff2` (if the package ships cyrillic);
  - `geist-mono-latin.woff2`, `geist-mono-cyrillic.woff2`.

  Write `@font-face` rules with the fontsource `unicode-range` values:
  - Geist: weight `300 700`;
  - Geist Mono: weight `400 500`.

  Font URLs stay relative to the stylesheet, so they work under `/portfolio/`. If a subset is missing from the package, keep Google Fonts for that subset only and note it in the report.
- [ ] **Step 3:** In `index.html`, remove the Google Fonts `preconnect` and stylesheet links and add the preload.
- [ ] **Step 4:** Run `npm test` and `npm run lint`; both pass. Screenshot home in EN and UA and compare the text rendering with the Task 1 screenshots: identical glyphs.
- [ ] **Step 5:** Commit: `perf(fonts): self-host Geist with preload`.

### Task 5: Make the first render server-safe

**Files:**
- Create: `src/utils/clientValue.ts`
- Modify:
  - `src/theme.ts` (`useCurrentTheme`);
  - `src/components/Hero/sceneSupport.ts` (the reduced-motion and page-visible initial state);
  - `src/components/layout/PageScrollbar.tsx` (the fine-pointer initial state);
  - `src/i18n.ts` (guard `localStorage`);
  - any other `useState(() => window…)` that renders on home.
- Test: `src/utils/clientValue.test.tsx`

**Interfaces:**
- Produces: `useClientValue<T>(subscribe: (cb: () => void) => () => void, getSnapshot: () => T, serverValue: T): T`, a thin wrapper over `useSyncExternalStore` with `getServerSnapshot = () => serverValue`.

- [ ] **Step 1:** Write the failing tests:
  - With `localStorage` theme set to `'light'` and `data-theme='light'`, `renderToString(<Probe/>)` (Probe renders `useCurrentTheme()`) outputs `dark`.
  - The same Probe rendered by RTL shows `light`.
  - `renderToString` of a Probe using `usePrefersReducedMotion` does not throw when `window.matchMedia` is deleted.
- [ ] **Step 2:** Implement `useClientValue`. Port the hooks:
  - `useCurrentTheme`: server value `'dark'`; subscribe with the same MutationObserver on `data-theme`.
  - Reduced motion: server value `false`.
  - Page visible: server value `true`.
  - Fine pointer: server value `false`.
- [ ] **Step 3:** In `i18n.ts`, read the locale with `typeof localStorage === 'undefined' ? Locales.EN : localStorage.getItem(…)`, and guard `document` in `syncHtmlLang` the same way.
- [ ] **Step 4:** Run `npm test` and `npm run lint`; both pass.
- [ ] **Step 5:** Commit: `refactor: server-safe first render for theme and media hooks`.

### Task 6: Client entry decides hydrate or render

**Files:**
- Create: `src/startup.ts`
- Modify: `src/main.tsx`
- Test: `src/startup.test.ts`

**Interfaces:**
- Produces: `shouldHydrate(input: { hash: string; locale: string | null; hasMarkup: boolean }): boolean`.

- [ ] **Step 1:** Write the failing tests:
  - `{ hash: '', locale: null, hasMarkup: true }` → true
  - `{ hash: '#/', locale: 'en', hasMarkup: true }` → true
  - `{ hash: '#/', locale: 'ua', hasMarkup: true }` → false
  - `{ hash: '#/cv', locale: 'en', hasMarkup: true }` → false
  - `{ hash: '#/projects', locale: null, hasMarkup: true }` → false
  - `{ hash: '', locale: null, hasMarkup: false }` → false
  - `{ hash: '#about', locale: null, hasMarkup: true }` → true (in-page section anchors are still the home route)
- [ ] **Step 2:** Implement `shouldHydrate`: the home route is a hash that is empty, `#/`, or does not start with `#/`.
- [ ] **Step 3:** Update `main.tsx`:
  - when `shouldHydrate(...)` is true, call `hydrateRoot(root, <StrictMode><Root/></StrictMode>)`;
  - otherwise set `root.innerHTML = ''` and call `createRoot(...).render(...)`.
  - `hasMarkup` is `root.hasChildNodes()`.
- [ ] **Step 4:** Run `npm test` and `npm run lint`; both pass.
- [ ] **Step 5:** Commit: `feat: hydrate prerendered home only for EN home visits`.

### Task 7: Prerender the home page at build

**Files:**
- Create: `src/entry-server.tsx`, `scripts/prerender.mjs`
- Modify: `package.json` (`build` script), `index.html` (`<div id="root"><!--app--></div>`)
- Test: `src/entry-server.test.tsx`

**Interfaces:**
- Produces: `render(): string` from `src/entry-server.tsx`. It renders `<App/>` with its index `<Home/>` inside `MemoryRouter initialEntries={['/']}`, with i18n in `en` and no `StrictMode` difference.
- To share the route tree, `Root.tsx` exports `AppRoutes` (the `<Routes>` block). Both entries use it.

- [ ] **Step 1:** Write the failing tests in `src/entry-server.test.tsx`. They call `render()`:
  - the output contains the hero name text from `translations` EN;
  - it contains `id="about"` and `id="contact"`;
  - the hero's root element (`data-testid` of the hero section) has no `opacity:0` inside its opening markup;
  - it does not throw.
- [ ] **Step 2:** Implement `entry-server.tsx`. If the hero content sits inside `Reveal` or another framer `initial={{opacity:0}}`, render it without the hidden initial state, so the HTML shows the hero (`initial={false}` for above-the-fold only). Sections below keep Reveal unchanged.
- [ ] **Step 3:** Write `scripts/prerender.mjs`:
  - import `dist-ssr/entry-server.js`;
  - replace `<!--app-->` in `dist/index.html` with `render()`;
  - delete `dist-ssr`;
  - fail with a non-zero exit if the placeholder is missing.
- [ ] **Step 4:** Change the `build` script to `tsc && vite build --base=/portfolio/ && vite build --ssr src/entry-server.tsx --outDir dist-ssr --base=/portfolio/ && node scripts/prerender.mjs`, and add `dist-ssr` to `.gitignore`. If the SSR build chokes on CSS or asset imports, set `ssr.noExternal` for framer-motion and react-router-hash-link.
- [ ] **Step 5:** Run `npm test` and `npm run lint`, then `npm run build`. Check that `dist/index.html` contains the hero text.
- [ ] **Step 6:** Serve `dist` and open the home page in the browser pane with EN dark, EN light and UA. The console shows no hydration or recoverable errors. The language and theme toggles work. `#/projects` and `#/cv` open.
- [ ] **Step 7:** Commit: `feat: prerender home HTML at build`.

### Task 8: After measurement and visual check

**Files:**
- Create: `docs/perf/2026-11-21-after.md`

- [ ] **Step 1:** Repeat the Task 1 Lighthouse runs on the new build and record the medians next to the baseline in a before/after table.
- [ ] **Step 2:** Repeat the Task 1 screenshots and diff them pixel by pixel against the before set (for example with pixelmatch in a scratchpad script). Report any diff over 0.1% of pixels with the image. Exclude the animated wine and knot regions, or freeze them with reduced motion emulation.
- [ ] **Step 3:** Run the full `npm test` and `npm run lint`, both gated on their exit codes.
- [ ] **Step 4:** Commit: `perf: record results after fast-loading work`.
