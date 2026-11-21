# Projects Section & Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Home "Selected work" shows 3 featured projects as glass panels on the live Wine shader band, with device-framed autoplaying videos; a new `#/projects` archive page lists every project in a filterable table.

**Architecture:** Extend the `Project` data model (type, year, featured, order, video, poster, store links). A shared `ProjectMedia` component renders a phone or browser frame with a lazy, viewport-driven `<video>` and a poster fallback. The home `Projects` section uses `Section`'s `bleed` slot with `WineSurface` behind glass rows. A new `ArchivePage` route renders a table with type filters. A dev-only Node script records WebM/MP4 loops of the live web demos.

**Tech Stack:** React 18, TS, Tailwind, react-router HashRouter, R3F (existing WineSurface), Vitest + RTL; dev tool: `ffmpeg-static` + Chrome CDP.

**Spec:** `docs/superpowers/specs/2026-11-21-projects-section-design.md` (mockups: `.superpowers/brainstorm/934-1795175676/content/projects-a-wine.html` section "A-Wine 2", `projects-options.html` section "Архів A").

## Global Constraints

- EN + UA keys for every new string; project descriptions keep current translations.
- Home shows `PROJECT_LIST.filter(p => p.featured)` sorted by `order`, max 3. Initial featured: Gadget Luxe, Vue Weather App, Rick and Morty (orders 1, 2, 3).
- Archive lists ALL projects; filters All · Mobile · Web with counts; "Commercial" filter only if any project has `commercial: true` (none now).
- Videos: `muted loop playsInline preload="none"`, play only while ≥ 25% in viewport, pause otherwise; under `prefers-reduced-motion: reduce` never autoplay (poster only). Each file ≤ 2 MB.
- Glass panel: bg rgba(10,10,11,.55), `backdrop-blur`, 1px white/10 border, radius 28px, padding 36px desktop / 20px mobile.
- No project detail pages; no "View case" links.
- Never push/deploy without the owner's go-ahead. In Git Bash, run vite commands with `/portfolio/` as `MSYS_NO_PATHCONV=1`.

## Review Focus

1. A project with no `video` → the poster shows (no broken `<video>` element). (Task 2 test.)
2. Reduced motion → `<video>` never gets `autoplay`/`play()` called. (Task 2 test.)
3. Filter "Mobile" with zero mobile projects → empty state text, not a blank table. (Task 3 test.)
4. Deep link `#/projects` reload under the `/portfolio/` base → the page renders (route test + manual preview check). (Task 3.)
5. A missing store link (`appStore`/`googlePlay` undefined) → that link isn't rendered. (Task 2 test.)

---

### Task 1: Data model

**Files:** Modify `src/types/Project.ts`, `src/data/projects.ts`, `src/data/content.test.ts` (or new `src/data/projects.test.ts`).

**Interfaces — Produces:**
```ts
export type ProjectType = 'mobile' | 'web';
export type Project = {
  id: number; name: string; category: string; description: string; stack: string[];
  codelink?: string; demolink?: string; appStore?: string; googlePlay?: string;
  type: ProjectType; year: number; featured?: boolean; order?: number; commercial?: boolean;
  poster: string;                       // was `image`
  video?: { webm?: string; mp4?: string };
};
export const featuredProjects: () => Project[]; // featured, sorted by order, max 3
```
Years: Gadget Luxe 2023, Vue Weather App 2024, Rick and Morty 2024, PokeAPI 2024, B&Q 2023, Todo 2023. All `type: 'web'`.

- [ ] Test: `featuredProjects()` names equal `['Gadget Luxe','Vue Weather App','Rick and Morty']`; every project has `type`, `year`, `poster`; `PROJECT_LIST.length === 6`.
- [ ] Run → FAIL. Implement (rename `image`→`poster` at all call sites). Run `npm test` → PASS. Commit `feat: extend project model with type, year, featured, video`.

### Task 2: ProjectMedia + home section (A-Wine 2)

**Files:** Create `src/components/Projects/ProjectMedia.tsx`, `src/components/Projects/useInViewVideo.ts`; modify `Projects.tsx`, `ProjectRow.tsx`; tests in `src/components/Projects/projects.test.tsx`.

**Interfaces — Consumes:** `featuredProjects()`, `Section` (`bleed` prop), `WineSurface` (default export, fills parent), `useReducedMotion` from `src/components/Hero/sceneSupport.ts`.
**Produces:** `ProjectMedia({ project }: { project: Project })` — phone frame (9:19.5) for `mobile`, browser frame (bar + 16:10) for `web`; renders `<video>` only when `project.video` exists, else `<img poster>` with slow pan (CSS, disabled under reduced motion). `useInViewVideo(ref, enabled: boolean)` plays/pauses by IntersectionObserver (threshold .25).

- [ ] Tests:
  - section renders exactly 3 rows (`data-testid="project-row"`) in featured order;
  - row with no `video` renders an `img` with the poster src and no `video` element;
  - row with `video` renders `<video muted loop playsinline preload="none">` with webm/mp4 `<source>`s;
  - under reduced motion (`matchMedia` stub true), `HTMLMediaElement.prototype.play` is never called even when intersecting;
  - links: Live and Code rendered from `demolink`/`codelink`; no App Store link when `appStore` undefined;
  - "All projects · Archive (6) →" links to `#/projects`.
- [ ] Run → FAIL. Implement per mockup "A-Wine 2": section content placed in `bleed` with `WineSurface` absolutely behind, rows in the glass panels from Global Constraints, media alternating sides, mono `0N — Web · 2023` line in wine-3, title 34px, description, chips, links. Mobile: single column, media first.
- [ ] `npm test`, `npm run lint`, build → green. Visual check (1440/390, EN/UA) vs mockup. Commit `feat: selected work on wine band with device-framed media`.

### Task 3: Archive page `#/projects`

**Files:** Create `src/pages/ArchivePage.tsx`, `src/pages/archive/archive.test.tsx`; modify `src/Root.tsx`, i18n.

**Interfaces — Consumes:** `PROJECT_LIST`, `ProjectType`, Header/Footer via App layout.
- [ ] Tests:
  - renders breadcrumb "Home / Archive", h1 "All projects", 6 table rows;
  - filter buttons "All · 6", "Mobile · 0", "Web · 6" with `aria-pressed`; clicking Web keeps 6, clicking Mobile shows empty-state text (EN key `archive_empty`);
  - no "Commercial" filter rendered;
  - each row: thumbnail img (lazy), year, name, description, type pill, chips, live/code link buttons with accessible names "Live demo — {name}" / "Code — {name}";
  - route `/projects` renders the page (MemoryRouter).
- [ ] Run → FAIL. Implement per mockup "Архів A" (hover wine gradient row; under 900px rows become stacked cards). Section label/heading styles consistent with the site. Scroll to top on mount.
- [ ] Green tests/lint/build; preview `#/projects` under `/portfolio/` and reload works. Commit `feat: projects archive page with type filters`.

### Task 4: Record demo videos (dev tool) and wire them

**Files:** Create `scripts/record-demo.mjs` (dev only, not imported by app), add devDependency `ffmpeg-static`; add `public/videos/{gadget-luxe,weather,rick-and-morty}.{webm,mp4}` and posters if better; modify `src/data/projects.ts` (`video` fields via `import.meta.env.BASE_URL + 'videos/...'`).

**Interfaces — Produces:** `node scripts/record-demo.mjs <url> <out-basename> [--seconds 10] [--script <steps.json>]` — launches Chrome (CDP, 1280x800), runs a small scripted interaction (scroll, hover, click a few items) for N seconds capturing `Page.startScreencast` frames, encodes with ffmpeg-static to WebM (VP9, CRF ~38) and MP4 (H.264, CRF ~30), ≤ 2 MB each, 25 fps, no audio.
- [ ] Record the 3 featured demos (their `demolink`s); interactions show the product's core flow (e.g. Gadget Luxe: scroll catalogue → open product → add to cart). Check file sizes ≤ 2 MB; re-encode if bigger.
- [ ] Wire `video` on the 3 projects; extend Task 2 test fixture expectation that featured rows now render `<video>`.
- [ ] Visual check: videos play in the frames on home (normal motion), poster under reduced motion. Commit `feat: demo video loops for featured web projects`.

### Task 5: QA

- [ ] Full home + `#/projects` + `#/cv` at 1440/1024/390, EN/UA, normal and reduced motion: no overflow, videos play only in view, glass panels readable on the shader, archive filters work, no console errors. Fix defects; commit. No deploy.
