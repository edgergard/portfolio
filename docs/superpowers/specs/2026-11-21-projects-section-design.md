# Projects section and archive: design (short)

Date: 2026-11-21 · Status: approved by owner (2026-11-21)
Mockups: .superpowers/brainstorm/934-1795175676/content/projects-a-wine.html (home "A-Wine 2") and projects-options.html ("Архів A").

## Intent

The home page shows only the 3 best projects, with motion (video) instead of static images, on the site's signature animated Wine background. Every project, old and new, is listed on a separate archive page. Recruiters see a focused selection first, and the full history is one click away.

## Decided by the owner

- **Home "Selected work", layout A-Wine 2:**
  - The whole section sits on the animated Wine background. Reuse the real shader band from the About skills panel (`WineSurface` / `WineCanvas`), full-bleed, with the CSS `.bg-wine-flow` as fallback.
  - Exactly 3 projects, as large alternating rows: media on one side, text on the other.
  - Each row sits in a dark glass panel (about rgba(10,10,11,.55), backdrop blur, 1px white/10 border, radius about 28px, padding about 36px), so the text is easy to read over the animation.
  - Media: mobile projects in a phone frame, web projects in a browser frame. Each plays a short, muted, looping, autoplaying, inline video. When there is no video, the poster image shows with a slow pan.
  - Text: number + type + year in mono, the title, a short description, stack chips, and links (Live / Code / store links when present).
  - Under the rows: an "All projects · Archive (N) →" button leading to the archive page.
- **Archive page "Архів A", a new route `#/projects`:**
  - Breadcrumb "Home / Archive", the title "All projects", and a summary line (count and year range).
  - Filter pills: All · Mobile · Web (with counts). A "Commercial" filter appears only once commercial projects exist.
  - A table with columns thumbnail · year · project (name + one-line description) · type pill (Mobile in a wine tint, Web neutral) · stack chips · link buttons (live ↗, code ⌥).
  - Hover highlights the row with a soft wine gradient. On mobile the table collapses into stacked rows (thumbnail, name, meta, links).
  - It lists ALL projects, including the 3 featured ones.
- Project detail pages are NOT built now (deferred). There is no "View case" link yet; rows link to live/code/store.

## Designer's calls (the owner can override)

- **Data model:** extend `Project` with
  - `type: 'mobile' | 'web'`, `year: number`, `featured?: boolean`, `order`;
  - `video?: { webm?: string; mp4?: string }` and `poster`;
  - optional store links `appStore?` / `googlePlay?`.
  
  The home page shows the projects with featured=true, sorted by `order`, at most 3.
- **Featured projects until the owner chooses:** the current Gadget Luxe, Vue Weather App and Rick and Morty. The project selection was explicitly postponed. The owner flips `featured` later. The archive lists all 6 current projects.
- **Videos:** no video files exist yet. Build the video support with the poster fallback now. For web projects with live demos, record short muted loops (about 8–12s, 1280x800, WebM/MP4, ≤ 2 MB each) automatically: drive the live demo in headless Chrome and encode the frames. ffmpeg isn't installed, so this would use the `ffmpeg-static` npm package as a dev-only tool, run outside the app bundle. Mobile project videos will be supplied by the owner later; the slots are ready.
- **Performance:**
  - videos use `preload="none"` and start when the row enters the viewport (IntersectionObserver), pause off-screen, and never autoplay under reduced motion (poster instead);
  - `playsInline muted loop`;
  - the archive thumbnails are lazy images.
- **Navigation:** the header "Work" link keeps scrolling to the home section; the archive is reachable from the section button. The archive page reuses Header and Footer.
- **i18n:** every new string in EN and UA. Project descriptions keep their current translations.

## Not in scope

- Project detail/case pages.
- Choosing the final 3 projects and the projects' own code rewrite (step 3).
- Mobile project videos (owner supplies them).
