# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio in the approved black/burgundy design: an R3F hero (obsidian knot on the "Wine" shader), About, Experience, Certifications, Projects, Contact, and a two-version CV page.

**Architecture:** Keep the Vite + React 18 + TS + Tailwind app, the HashRouter and the GitHub Pages deploy. Content lives in typed data modules plus i18n JSON (EN/UA). Each section is a focused component inside a shared `Section` shell. The 3D scene is an isolated, lazy-loaded R3F component, and pure helpers (damping, scaling, shader uniforms) are unit-tested.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind 3, three, @react-three/fiber, i18next, framer-motion (existing), Vitest + @testing-library/react + jsdom (new).

**Spec:** `docs/superpowers/specs/2026-11-20-portfolio-redesign-design.md`. The visual reference is `docs/superpowers/specs/2026-11-20-portfolio-redesign-prototype.html`: take exact CSS values, copy and shader code from it.

## Global Constraints

- Colors: bg `#0A0A0B`, text `#FFFFFF`, secondary `#A3A3A9`, muted `#6E6E74` / `#8C8C92`, hairline `#1E1E21`, chip border `#2A2A2E`, accent `#8B1426` (buttons) / `#B3122E` (lines, numbers, bars) / `#D0213F` (status dot).
- Fonts: Geist (UI and headings, weight 500, negative tracking); Geist Mono (labels: uppercase, letter-spacing .06–.08em).
- Every user-visible string has an EN key and a UA key. The default locale is EN.
- No phone number anywhere in `src/` or `public/`.
- The deploy stays `npm run deploy` with `--base=/portfolio/` and the HashRouter.
- Copy for About, Experience and Certifications is verbatim from the prototype. Project descriptions keep the current translations (no new claims).
- English: About shows **C1**, the certificate card shows **C2 Proficient 74/100** (deliberate).
- Breakpoint for the mobile layout: `< 900px`.

## Review Focus

1. WebGL unavailable or context lost → the hero still shows text, and the panel shows a static gradient instead of a blank or crashing canvas. (Task 4: `HeroScene` falls back when `WebGL` is missing.)
2. `prefers-reduced-motion: reduce` → no spin, a frozen shader frame, no pointer chase. (Task 4 test.)
3. Locale switch to UA → no raw keys (like `cert_awarded`) on any section or on the CV page. (Task 2: key-parity test EN vs UA.)
4. Deep link `#/cv?v=frontend&view=pdf` opened directly or reloaded → that CV opens in that view. An unknown value falls back to `react-native` + `web`. (Task 9 test.)
5. Mobile Safari or Android opening the PDF view → a card with Open/Download, never a blank `<object>`. (Task 9 test via a mocked `matchMedia`.)

---

### Task 1: Tooling, theme tokens, fonts, cleanup

**Files:**
- Modify: `package.json`, `tailwind.config.js`, `index.html`, `styles.css`, `vite.config.ts`
- Create: `vitest.setup.ts`, `src/test/smoke.test.tsx`
- Delete: `src/pages/Archive.tsx`, `src/components/Loader.tsx`, `src/assets/react.svg`, `src/images/ReactLogo.png`, `public/vite.svg`

**Interfaces:**
- Produces: Tailwind colors `bg`, `ink`, `ink-2`, `muted`, `muted-2`, `line`, `chip`, `wine` (#8B1426), `wine-2` (#B3122E), `wine-3` (#D0213F); fonts `font-sans` = Geist, `font-mono` = Geist Mono. Use `theme.extend` (the current config replaces the whole palette, so rewrite it). Scripts: `test` = `vitest run`.

- [ ] **Step 1:** Install the dev dependencies `vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom` and the dependencies `three @react-three/fiber @types/three`. Remove `react-type-animation`, `react-loader-spinner` and `classnames` (unless still used after the rewrite).
- [ ] **Step 2:** Add a `test` block to `vite.config.ts`: `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']` (setup imports `@testing-library/jest-dom/vitest` and stubs `matchMedia` and `IntersectionObserver`).
- [ ] **Step 3: Write the smoke test** `src/test/smoke.test.tsx`: render `<Root />` and expect `getByRole('heading', { level: 1 })` to have the text `Oleksandr Bryksin` (whitespace-normalised).
- [ ] **Step 4:** Run `npm test`. Expected: FAIL (the h1 currently has a typing animation).
- [ ] **Step 5:** Load Geist and Geist Mono in `index.html` (Google Fonts `family=Geist:wght@300..700&family=Geist+Mono:wght@400;500`), drop Inter, set `body { background:#0A0A0B; color:#fff; font-family: Geist }`, and set the title to `Oleksandr Bryksin — React Native & Frontend Developer`. Rewrite the Tailwind theme with the tokens above. Make the minimal temporary change to `Hero` so the smoke test passes (a static h1 with two lines; Task 4 replaces it). Remove the `/archive` route from `Root.tsx`.
- [ ] **Step 6:** Run `npm test && npm run build`. Expected: PASS, and the build succeeds.
- [ ] **Step 7:** Commit `chore: test tooling, dark theme tokens, Geist, remove unused deps`.

### Task 2: Content data and translations

**Files:**
- Create: `src/data/content.ts`, `src/data/content.test.ts`
- Modify: `src/translations/en.json`, `src/translations/ua.json`, `src/types/Project.ts`
- Delete: `src/data/data.ts` (after migrating the data)

**Interfaces:**
- Produces:
  ```ts
  export type Fact = { labelKey: string; value: string; unitKey: string };
  export type SkillGroup = { titleKey: string; items: string[] };
  export type Job = { id: 'pecode'|'hys'|'self'; company: string; roleKey: string; periodKey: string; bulletKeys: string[]; stack: string[] };
  export type Education = { metaKey: string; titleKey: string };
  export type Certificate = { id: 'efset'; issuer: string; level: 'C2'; levelNameKey: string; score: number; max: number; parts: { labelKey: string; value: number }[]; awardedKey: string; url: string };
  export const FACTS: Fact[]; SKILLS: SkillGroup[]; JOBS: Job[]; EDUCATION: Education[]; CERTIFICATES: Certificate[];
  export const EMAIL = 'oleksandrbryksin@gmail.com';
  export const SOCIALS: { id: 'linkedin'|'github'|'telegram'; label: string; href: string }[];
  ```
  `Project` gains `category: string` (for example `'E-commerce'`). `PROJECT_LIST` moves to `src/data/projects.ts` (same six entries, the current links and images).

- [ ] **Step 1: Write tests** in `content.test.ts`:
  - `JOBS.map(j => j.id)` equals `['pecode','hys','self']`.
  - `CERTIFICATES[0]` matches `{ level:'C2', score:74, max:100, url:'https://cert.efset.org/en/oWhPgz' }`, and its parts values are `[72,76]`.
  - `FACTS.map(f => f.value)` equals `['2.5+','5','95–100','C1']`.
  - EN and UA JSON have identical key sets (sorted `Object.keys` are equal).
  - No file under `src/` contains `380635383049` (read it with `import.meta.glob('/src/**/*.{ts,tsx,json}', { query: '?raw', eager: true })`).
- [ ] **Step 2:** Run `npm test -- content`. Expected: FAIL (the module is missing).
- [ ] **Step 3:** Implement `content.ts` and `projects.ts`, and add all the keys. EN copy comes verbatim from the prototype sections (About headline/paragraph, fact labels, skill groups, 3 jobs with their bullets, education, certificate labels, contact headline "Let's build something precise.", nav, buttons "View experience", "View CV", "Live demo", "Code", "Send message"). UA keys are translations of the EN copy. Remove the obsolete keys (`hello`, `occupation`, `archive`, `projects_archive`, `date_exp_hys`, etc.).
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: typed content data and EN/UA copy for redesign`.

### Task 3: Layout shell (Header, Section, Footer)

**Files:**
- Create: `src/components/layout/Section.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/layout.test.tsx`
- Modify: `src/components/Header/Header.tsx`, `BurgerMenu.tsx`, `NavLink.tsx`, `LocaleButton.tsx`, `src/App.tsx`
- Delete: `src/components/Footer.tsx`, `src/components/OutletContainer.tsx`

**Interfaces:**
- Produces: `Section({ id, index, labelKey, children }: { id: string; index: number; labelKey: string; children: ReactNode })`. It renders `<section id>` with a sticky mono label `0{index}` (number in `wine-2`) on the left (280px column), content on the right, max-w 1280, padding 120px/40px (80px/24px under 900px), and a top hairline.
- Header nav order: Work (`#projects`), Experience, About, Contact, CV (`/cv` route). Then EN/UA.

- [ ] **Step 1: Write tests:**
  - Header renders links named `Work`, `Experience`, `About`, `Contact` and `CV`, and the `CV` href ends with `#/cv`.
  - Clicking `UA` switches `i18n.language` to `ua`.
  - `Section` renders the label text `02` + `Experience` when `index={2}` and `labelKey='experience'` are passed.
  - The footer contains `Back to top`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement with the styling from the prototype (`.s`, `.lbl`, the header `.nav`, `.foot2`). The burger menu stays for `<900px`. The header is sticky with a hairline bottom.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: header, section shell and footer in new design`.

### Task 4: Hero with the R3F scene

**Files:**
- Create: `src/components/Hero/Hero.tsx`, `src/components/Hero/HeroScene.tsx`, `src/components/Hero/Knot.tsx`, `src/components/Hero/WineBackdrop.tsx`, `src/components/Hero/wineShader.ts`, `src/components/Hero/motion.ts`, `src/components/Hero/hero.test.tsx`, `src/components/Hero/motion.test.ts`
- Delete: `src/components/Hero.tsx`

**Interfaces:**
- Produces in `motion.ts`:
  - `damp(current: number, target: number, rate: number, dt: number): number` returns `current + (target - current) * (1 - Math.exp(-rate * dt))`.
  - `stageScale(aspect: number): number` returns `0.85 * Math.min(1, aspect / 0.95)`.
  - `tiltTarget(px: number, py: number): { x: number; y: number }` returns `{ x: -clamp(py,±1.5)*0.45, y: clamp(px,±1.5)*0.6 }`.
- `wineShader.ts`: exports `WINE_PALETTE = ['#0A0A0B','#3E0712','#8B1426','#B8233F']`, `WINE = { speed: 0.26, warp: 3.0, radius: 0.95, amount: 1.0 }`, `createWineUniforms(): Record<string, THREE.IUniform>`, `vertexShader`, `fragmentShader` (copy from the prototype's `flowPlane`, including `#include <colorspace_fragment>`).
- `HeroScene` props: `{ reducedMotion: boolean; onFps?: (fps: number) => void }`.
- `Hero` renders the text column, the caption `Fig. 01 — Torus knot (2,3) · Obsidian · {fps} fps`, and `<Suspense>` around a `React.lazy(HeroScene)`.

- [ ] **Step 1: Write the `motion.test.ts` tests:**
  - `damp(0,1,3,1/60)` ≈ `0.0488` (±1e-3).
  - `damp(0,1,3,10)` > `0.999`.
  - `stageScale(0.73)` ≈ `0.653`.
  - `stageScale(2)` = `0.85`.
  - `tiltTarget(2,-2)` = `{x:0.675,y:0.9}`.
  - `createWineUniforms().uAmount.value === 1` and `uWarp.value === 3`.
- [ ] **Step 2: Write the `hero.test.tsx` tests** (mock `@react-three/fiber` `Canvas` to a `div data-testid="canvas"`):
  - The h1 text is `Oleksandr Bryksin`.
  - The eyebrow is `React Native & Frontend Developer — Kyiv, UA`.
  - The `View experience` link targets `#experience`.
  - The `View CV` link targets `#/cv`.
  - With `matchMedia('(prefers-reduced-motion: reduce)')` returning true, `HeroScene` gets `reducedMotion=true`.
  - When `WebGLRenderingContext` is undefined, the panel renders `data-testid="hero-fallback"` and no canvas.
- [ ] **Step 3:** Run. Expected: FAIL.
- [ ] **Step 4:** Implement:
  - **Canvas:** `dpr={[1,2]}`, camera `{ fov: 32, position: [0,0,8] }`, `gl={{ toneMapping: ACESFilmicToneMapping }}`, an environment from `RoomEnvironment` through PMREM in a small `useEffect`.
  - **Knot:** `TorusKnotGeometry(1,0.34,420,72,2,3)`, scale `1.35/1.84 × stageScale(aspect)`. Obsidian material values come from the spec. Spin, float and tilt go through `damp`.
  - **WineBackdrop:** a plane 9×9 at z −2.5. `uTime = t * WINE.speed`. The pointer offset is lerped.
  - **Rendering control:** `frameloop` is `'never'` when reduced motion is on (render once), and `'demand'`-paused when the hero is off-screen (IntersectionObserver) or `document.hidden`.
  - **FPS:** reported every 500ms.
  - **Fallback:** a CSS radial gradient using the wine palette.
- [ ] **Step 5:** Run `npm test && npm run build`. Expected: PASS.
- [ ] **Step 6: Manual check.** `npm run dev`, then compare the hero to the prototype at 1280×800 and at 390×844. The mobile layout stacks text above a canvas at ~45vh and has no caption.
- [ ] **Step 7:** Commit `feat: R3F hero with obsidian knot and Wine shader backdrop`.

### Task 5: About and Experience sections

**Files:**
- Create: `src/components/About/About.tsx` (rewrite), `src/components/Experience/Experience.tsx`, `src/components/sections.test.tsx`
- Delete: `src/components/About/AboutList.tsx`, `TabButton.tsx`

**Interfaces:**
- Consumes: `FACTS`, `SKILLS`, `JOBS`, `EDUCATION` (Task 2) and `Section` (Task 3).

- [ ] **Step 1: Write tests:**
  - About renders 4 facts, and `C1` is visible.
  - It renders the 4 skill group titles `Web`, `Mobile`, `Data & state` and `Ship & craft`.
  - Experience renders 3 rows in order Pecode, HYS Enterprise, Self-employed.
  - The Pecode row has 5 bullets, and `Oct 2025 — Oct 2026` is visible.
  - No element with the text `Current`.
  - 2 education cards.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement with the prototype styles (`.facts` in 4 columns, `.skills` in 4 columns, `.xp-row` with the hover bar, `.tags`, `.edu`). Use a subtle framer-motion reveal (`opacity 0→1, y 12→0`, once).
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: About and Experience sections`.

### Task 6: Certifications section

**Files:**
- Create: `src/components/Certifications/Certifications.tsx`. Append its tests to `src/components/sections.test.tsx`.

- [ ] **Step 1: Write tests:**
  - It renders `C2`, `74`, `/100`, the bars `Reading` 72 and `Listening` 76, and the text `Awarded 18 Nov 2026`.
  - The link `View certificate` has the href `https://cert.efset.org/en/oWhPgz`, `target="_blank"` and `rel` containing `noreferrer`.
  - There is no placeholder card.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the `.cert` card styles from the prototype. Bar width = `value/max*100%`. The grid uses 2 columns (1 under 900px).
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: certifications section with EF SET card`.

### Task 7: Projects section (layout A)

**Files:**
- Modify: `src/components/Projects/Projects.tsx`, `ProjectCard.tsx` (becomes `ProjectRow.tsx`), `ProjectCardList.tsx` (delete; the list renders in `Projects`)
- Test: append to `src/components/sections.test.tsx`

- [ ] **Step 1: Write tests:**
  - It renders 6 rows.
  - Each row has visible links named `Live demo` and `Code` with the hrefs from `PROJECT_LIST`.
  - There is no link to `/archive`.
  - Row 2 has the class/attribute for the reversed order (`data-reverse="true"`).
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the alternating rows (`grid-cols-[1.35fr_1fr]`, the image on the right for even rows; a single column under 900px). The number + category is in `wine-2` mono, then the title, the current description via `t(description)`, the chips, and the links (Live demo underline `wine`). On hover the image scales to 1.035. Images get `loading="lazy"`.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: projects as alternating case rows with visible links`.

### Task 8: Contact section

**Files:**
- Modify: `src/components/Contact/Contact.tsx`, `ContactForm.tsx`; delete `LinkIcons/` if unused
- Test: append to `src/components/sections.test.tsx`

- [ ] **Step 1: Write tests:**
  - The heading is `Let's build something precise.`.
  - The email link is `mailto:oleksandrbryksin@gmail.com`.
  - The socials list has LinkedIn, GitHub, Telegram, `CV · React Native` (href `/cv/oleksandr-bryksin-react-native-cv.pdf`, with a `download` attribute) and `CV · Frontend`.
  - There is a `View CV` link to `#/cv`.
  - Submitting an empty form shows the existing validation errors and does not call `emailjs.sendForm` (mocked).
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Restyle per the prototype (`.contact`, `.socials`, `.form`). Keep the EmailJS logic, the zod schema and the toasts (restyle the toasts dark). Remove the phone. PDF hrefs use `import.meta.env.BASE_URL` so they work under `/portfolio/`.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: contact section in new design, CV downloads, no phone`.

### Task 9: CV page (two versions, web and PDF views)

**Files:**
- Create: `public/cv/oleksandr-bryksin-react-native-cv.pdf`, `public/cv/oleksandr-bryksin-frontend-cv.pdf` (copied from `C:\Projects\CV\Oleksandr Bryksin - React Native Developer CV.pdf` and `C:\Projects\CV\Oleksandr Bryksin - Frontend Developer CV.pdf`), `src/data/cv.ts`, `src/pages/CvPage.tsx`, `src/pages/cv/CvWeb.tsx`, `src/pages/cv/CvPdf.tsx`, `src/pages/cv/useCvParams.ts`, `src/pages/cv/cv.test.tsx`, `src/pages/cv/print.css`
- Modify: `src/Root.tsx` (route `/cv`)

**Interfaces:**
- `cv.ts`:
  ```ts
  export type CvVariant = 'react-native' | 'frontend';
  export type CvDoc = { variant: CvVariant; title: string; pdf: string; summary: string; contacts: { label: string; href: string }[]; experience: { company: string; role: string; period: string; bullets: string[] }[]; skills: { group: string; items: string[] }[]; education: { title: string; period: string }[]; languages: string[] };
  export const CVS: Record<CvVariant, CvDoc>;
  ```
  The text is copied faithfully from each PDF (read the PDFs), in the language of the PDF, with no additions.
- `useCvParams(): { variant: CvVariant; view: 'web'|'pdf'; setVariant(v): void; setView(v): void }` reads and writes `?v=&view=` in the hash route. Invalid values fall back to `react-native` / `web`.

- [ ] **Step 1: Write tests** (render at `#/cv` with MemoryRouter):
  - By default the `React Native` tab is selected (`aria-pressed="true"`), the view is Web, and the title from `CVS['react-native'].title` is visible.
  - `?v=frontend&view=pdf` selects Frontend + PDF.
  - `?v=bogus&view=x` falls back to the defaults.
  - Clicking `Frontend` updates the URL to contain `v=frontend`.
  - The `Download PDF` link href ends with the selected PDF filename and has the `download` attribute.
  - The PDF view on desktop renders `<object type="application/pdf">`.
  - With `matchMedia('(max-width: 899px)')` true, the PDF view instead renders the links `Open PDF` and `Download`, and no `<object>`.
  - Each `CvDoc` has at least 1 experience item and a non-empty summary.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement:
  - **Page:** the segmented switches in the prototype's `.pt` style, the header and the footer shared.
  - **CvWeb:** laid out like the Experience rows.
  - **print.css:** `@media print` gives a white background, black text, A4 margins, and hides the header, the switches and the footer.
  - **PDF hrefs:** built with `import.meta.env.BASE_URL`.
  - Scroll to top on mount.
- [ ] **Step 4:** Run `npm test && npm run build`. Expected: PASS, and `dist/cv/*.pdf` exists.
- [ ] **Step 5: Manual check.** `npm run preview`, then open `/portfolio/#/cv?v=frontend&view=pdf`, print the Web view, and check that the downloads work.
- [ ] **Step 6:** Commit `feat: CV page with React Native/Frontend versions, web and PDF views`.

### Task 10: Final polish and verification

**Files:**
- Modify: whatever the checks below reveal. `README.md` (short project description and scripts).

- [ ] **Step 1:** Run `npm run lint && npm test && npm run build`. Expected: all clean (fix the lint config if the new test files need `vitest` globals).
- [ ] **Step 2:** In `npm run preview`, compare every section to the prototype at 1440×900, 1280×800, 768×1024 and 390×844, in EN and UA. Check spacing, the label alignment and that nothing overflows horizontally (`document.documentElement.scrollWidth === innerWidth`).
- [ ] **Step 3:** Run Lighthouse on the preview (mobile). Target Performance ≥ 90 and Accessibility ≥ 95. If the scene hurts LCP, defer the canvas mount until after `requestIdleCallback`.
- [ ] **Step 4:** Commit `chore: final polish and README`. Do not deploy: deploying to GitHub Pages needs the owner's go-ahead.
