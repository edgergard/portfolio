# Portfolio redesign — design

Date: 2026-11-20 · Branch: `redesign/dark-portfolio` · Status: approved by owner (2026-11-20)

Visual reference (open in a browser; images point to the brainstorm server and may not load):
`docs/superpowers/specs/2026-11-20-portfolio-redesign-prototype.html`. It contains the final hero
scene code (the Wine shader, the obsidian knot, the pointer tilt), the CSS and all section markup. Treat it as the
source of truth for look and copy, not as production code.

## Intent

The site is for recruiters and hiring managers. They should see the owner's experience and
professional base quickly, and come away thinking the owner is very aesthetic and meticulous: the site
itself has to look minimal, clean, correct and precise. One target job requires Three.js, so the
hero's 3D scene is also a skills demonstration and must be real Three.js code, well integrated into React.

This is step 1 of 3. Step 2 (experience content) is folded in here. Step 3 (rewriting the pet projects) comes later;
the projects section must make room for it.

### Goals

- New visual identity: black background, white text, burgundy accent.
- Hero with a live 3D scene (obsidian torus knot on an animated "Wine" shader background).
- Experience is a first-class, visible section (no longer hidden in a tab).
- New Certifications section.
- Project links visible without hover (touch devices).
- ~~Remove the phone number from the page.~~ Reversed by the owner in round 1c: the phone is now published (see Constraints).
- Two CVs (React Native first, Frontend second): download them, view the PDF on the site, and view an HTML version.

### Non-goals

- New pet projects or new project screenshots (step 3).
- Blog, case-study pages, CMS, or migration to Next.js.
- Backend changes: the contact form keeps using EmailJS.

### Anti-goals (a failure even if it "works")

- Looks like a template (typing animation, React logo, generic purple accent).
- The 3D scene stutters, blocks the page on load, or drains a laptop/phone battery.
- Inconsistent spacing or typography, sloppy details.

## Constraints

- Hosting stays GitHub Pages (`npm run deploy`, `--base=/portfolio/`), HashRouter, static build.
- Two languages stay: EN (default) and UA via i18next. All new copy needs both. The UA copy is
  translated from the EN copy below; the owner reviews it.
- Must work on mobile.
- Phone number: allowed by the owner (round 1c, reverses the earlier "no phone" rule). Contact shows
  +380 63 538 3049 as a tel: link with Copy, and the WhatsApp row opens https://wa.me/380635383049.

## Approaches considered

1. **Update the current Vite + React + TS + Tailwind project, 3D with React Three Fiber**: picked.
   Keeps hosting and tooling. R3F shows Three.js and its integration into a React app, which is what the
   target job looks for.
2. Same project, plain Three.js in a `useEffect`: fewer dependencies, but the 3D code fits the React structure poorly
   and is a weaker signal.
3. Migrate to Next.js: unnecessary complexity for a static portfolio on GitHub Pages.

The owner chose 1.

## Decided design

### Visual system

- Background `#0A0A0B`. Text `#FFFFFF`. Secondary text `#A3A3A9`. Muted/labels `#6E6E74` / `#8C8C92`.
  Hairlines `#1E1E21`, chip borders `#2A2A2E`.
- Accent burgundy: `#8B1426` (buttons), `#B3122E` (lines, numbers, bars), `#D0213F` (status dot).
  Use the accent sparingly.
- Type: Geist (UI, headings), Geist Mono (labels, captions, tags; uppercase, letter-spacing ~.06–.08em).
  Headings weight 500, tight negative tracking.
- Layout: hairline-ruled grid, generous whitespace. Each section has a sticky left label "01 About" (number in
  burgundy), with content on the right. Max width 1280px, 40px side padding (24px on mobile).

### Header

Name left. Links (Work / Experience / About / Contact) and EN / UA switch right, in mono uppercase.
Sticky. Mobile: a burger menu, as today, restyled.

### Hero (first screen, 100vh)

- Left column: eyebrow "React Native & Frontend Developer — Kyiv, UA" with a short burgundy line;
  the name "Oleksandr / Bryksin" in **plain white** (no chrome gradient); lede "I build precise mobile apps with
  React Native & Expo and fast web products with React, Next.js and Three.js."; primary button
  "View experience →" (burgundy, scrolls to Experience), text link "View CV" (→ `#/cv`, see CV below).
- Bottom strip: "2.5+ yrs commercial · 5 apps shipped" | "● Open to work · Scroll ↓".
- Right panel: the 3D canvas, separated by a hairline, with small "+" registration marks and a mono caption
  "Fig. 01 — Torus knot (2,3) · … · NN fps" (live FPS counter).
- **Scene** (values in the prototype):
  - Camera fov 32 at z = 8. ACES tone mapping. RoomEnvironment PMREM as the environment.
  - **Knot:** TorusKnotGeometry(1, 0.34, 420, 72, 2, 3), scaled to radius ≈ 1.35, then by the responsive
    stage factor `0.85 × min(1, aspect/0.95)`.
    **Obsidian** material: MeshPhysicalMaterial color `#050506`, metalness 0.2, roughness 0.08, clearcoat 1,
    clearcoatRoughness 0.02, envMapIntensity 2.2.
  - **Knot motion:** slow spin (x: t·0.12, y: t·0.18), float y = sin(t·0.8)·0.06. Tilts toward the pointer
    (x = −py·0.45, y = px·0.6), frame-rate-independent damping, rate 3.
  - **Background "Wine":** a full-panel plane at z = −2.5 with a custom ShaderMaterial. Domain-warped fbm
    noise blends the palette `#0A0A0B`, `#3E0712`, `#8B1426`, `#B8233F`. Speed 0.26, warp 3.0, radius 0.95,
    amount 1.0. The centre drifts slightly toward the pointer. Output goes through `colorspace_fragment`.
    It must look vivid and continuously flowing, as approved.

### Sections (copy in the prototype)

1. **01 About:** positioning headline (part in grey), one paragraph. Four facts:
   2.5+ years · 5 apps (iOS & Android) · 95–100 Lighthouse · English C1.
   (Deliberate: About shows the owner's overall level, C1. The Certifications card shows the EF SET result,
   C2, which covers only reading and listening. The owner approved this pairing.) Skills in four columns: Web, Mobile,
   Data & state, Ship & craft.
2. **02 Experience:** rows with the period on the left (mono), then role · company, bullets and stack chips.
   Hover: a burgundy bar slides in on the left. Pecode (Oct 2025 — Oct 2026), HYS Enterprise (Apr 2024 — Oct 2025),
   Self-employed (Jul 2023 — Apr 2024). No "Current" badge. Education as two cards (KPI 2019–2021;
   Mate Academy 2023).
3. **03 Certifications:** EF SET card. Level **C2 Proficient**, score 74/100, bars Reading 72 / Listening 76,
   "Awarded 18 Nov 2026", link to https://cert.efset.org/en/oWhPgz. A grid that takes more cards later.
   No placeholder card in production.
4. **04 Selected work, layout A:** large alternating rows (image left/right, ~1.35:1 columns): number +
   category in burgundy, title, description, stack chips, and "Live demo ↗" (burgundy underline) / "Code ↗"
   links, always visible. On hover the image zooms gently. The current 6 projects stay, with the current images.
   *Copy (designer's call):* keep the current descriptions and translations for all six until step 3. Use the
   prototype only for the layout, and don't add new claims (e.g. "team of five"). Category labels are plain
   tech tags (E-commerce, Vue, GraphQL, API, Landing, Todo).
   The Archive page goes away, so all projects sit on the home page.
5. **05 Contact:** big headline "Let's build something precise.", the email as a large link, a socials list
   (LinkedIn, GitHub, Telegram, CV), and the EmailJS form restyled (dark inputs, burgundy focus and button).
   Phone number shown (owner's round 1c decision, see Constraints). Footer: "© year Oleksandr Bryksin · Built with React & Three.js · Back to top ↑".

### CV (two versions)

The owner has two CVs. **React Native is the priority**, Frontend comes second. Sources:
- `C:\Projects\CV\Oleksandr Bryksin - React Native Developer CV.pdf`
- `C:\Projects\CV\Oleksandr Bryksin - Frontend Developer CV.pdf`

Copy them into `public/cv/` with URL-safe names (e.g. `oleksandr-bryksin-react-native-cv.pdf`,
`oleksandr-bryksin-frontend-cv.pdf`). They replace the Google Drive link.

- **CV page:** a new route `#/cv` in the same visual system.
  - Top: a segmented switch **React Native** (default) | **Frontend**, and a second switch **Web** (default) | **PDF**.
  - Always visible: "Download PDF ↓" for the selected CV (`download` attribute).
  - **Web view:** the selected CV laid out in HTML, with content copied faithfully from its PDF (no new claims).
    Use the site's typography: name, title, contacts, summary, experience rows like the Experience section, skills,
    education, languages. It has print styles, so printing gives a clean A4 page.
  - **PDF view:** the actual PDF embedded on the page. Desktop uses the browser's viewer (`<object>`/`<iframe>`).
    Mobile browsers render inline PDFs unreliably, so on mobile show a preview card with "Open PDF ↗" and
    "Download ↓" instead. (react-pdf / pdf.js is the builder's call if it renders more consistently; mind the
    bundle size.)
  - The URL keeps the choice (e.g. `#/cv?v=frontend&view=pdf`) so a link to a specific CV can be shared.
- **Entry points:**
  - Hero: the secondary link becomes **"View CV"** → `#/cv`.
  - Contact socials: "CV · React Native ↓" and "CV · Frontend ↓" are direct downloads, plus "View CV" → `#/cv`.
  - The header gets a "CV" nav link.

### Motion and performance

- Respect `prefers-reduced-motion`: render a static frame (no shader time, no spin).
- The canvas loads lazily so it doesn't block first paint, and the text renders immediately.
- Pause rendering when the hero is off-screen or the tab is hidden.
- Pixel ratio ≤ 2.
- Section reveal: a subtle fade/translate on scroll at most (framer-motion is already installed).

### Mobile (< 900px)

The hero stacks: text first, canvas below it at ~45vh, without the caption clutter. Sections become
single-column, and the sticky labels become static.

## Left to the builder

- Component structure and file layout.
- Using `@react-three/drei` or not.
- Tailwind theme tokens vs CSS variables.
- How to load Geist (Google Fonts or self-hosted).
- Upgrading dependencies (React, Vite, Tailwind) as long as the build and deploy keep working.
- Removing unused dependencies (react-type-animation, react-loader-spinner, etc.).
- Small exact values not listed here: take them from the prototype.
