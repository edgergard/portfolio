# Oleksandr Bryksin — portfolio

Personal site of a React Native & frontend developer: a dark single page (hero with a
real-time three.js torus knot, About, Experience, Certifications, Selected work, Contact)
and a `#/cv` page with React Native / Frontend versions in web and PDF views. English and
Ukrainian via i18next.

Live: https://edgergard.github.io/portfolio

## Stack

Vite, React 18, TypeScript, Tailwind CSS, React Router (hash routing for GitHub Pages),
three.js with @react-three/fiber, react-hook-form + zod, EmailJS. Tests: Vitest and
Testing Library on jsdom.

## Scripts

| Command           | What it does                                                     |
| ----------------- | ---------------------------------------------------------------- |
| `npm run dev`     | Dev server at http://localhost:5173/                              |
| `npm run build`   | Type-check and build to `dist/` with the `/portfolio/` base       |
| `npm run preview` | Serve the build at http://localhost:4173/portfolio/               |
| `npm test`        | Run the Vitest suite once                                         |
| `npm run lint`    | ESLint over `.ts` / `.tsx`, zero warnings allowed                 |
| `npm run deploy`  | Build and publish `dist/` to the `gh-pages` branch                |

## Notes

- The 3D scene is lazy-loaded and mounted once the page is idle; without WebGL a CSS
  gradient is shown instead. With `prefers-reduced-motion` the scene and the wine fills keep
  moving at a gentler pace (pointer tilt still works); nothing freezes.
- CV PDFs live in `public/cv/`; the contact form sends through EmailJS.
