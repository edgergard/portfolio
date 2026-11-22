# Oleksandr Bryksin — portfolio

Personal site of a React Native & frontend developer: a dark single page (hero with a
real-time three.js torus knot, About, Experience, Certifications, Selected work, Contact),
a projects archive at `/projects`, and CV pages at `/cv/react-native` and `/cv/frontend`
(web view by default, PDF with `?view=pdf`). English at `/`, Ukrainian under `/uk`.

## Stack

Next.js 16 (App Router, every page prerendered), React 19, TypeScript, Tailwind CSS 3,
motion, three.js with @react-three/fiber, react-hook-form + zod, Resend, Vercel Speed
Insights. Tests: Vitest and Testing Library on jsdom.

## Setup

```sh
npm install
cp .env.example .env.local   # then fill in the values
```

| Variable                          | Used for                                          |
| --------------------------------- | ------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | Canonical links, hreflang, sitemap, Open Graph    |
| `RESEND_API_KEY`                  | Contact form: Resend API key (server only)        |
| `CONTACT_TO_EMAIL`                | Contact form: where messages go                   |
| `CONTACT_FROM`                    | Optional sender (default `onboarding@resend.dev`) |

## Scripts

| Command         | What it does                                                   |
| --------------- | -------------------------------------------------------------- |
| `npm run dev`   | Dev server at http://localhost:3000/                           |
| `npm run build` | Type-check and build the production site into `.next/`         |
| `npm start`     | Serve the production build at http://localhost:3000/           |
| `npm test`      | Run the Vitest suite once                                      |
| `npm run lint`  | ESLint (flat config, `eslint.config.mjs`), zero warnings       |

## Deploy

The site is hosted on Vercel. Import the repository as a Next.js project, set the variables
above in the project's environment settings, and every push builds and deploys
(`vercel.json` only skips builds of commits without Next.js; it cannot skip `main`, which has no
`vercel.json`. Until cut-over, set Ignored Build Step in the Vercel project settings, see the migration plan).

## Notes

- The language is chosen by the URL; the `lang` cookie remembers a switch, so a visitor who
  picked Ukrainian is redirected from `/` to `/uk` (`src/proxy.ts`).
- The 3D scene is lazy-loaded and mounted once the page is idle; without WebGL a CSS
  gradient is shown instead. With `prefers-reduced-motion` the scene and the wine fills keep
  moving at a gentler pace (pointer tilt still works); nothing freezes.
- CV PDFs live in `public/cv/`; the contact form posts to `src/app/api/contact/route.ts`, which mails
  `CONTACT_TO_EMAIL` through Resend.
- Dev tools in `scripts/`: `og-image.mjs` (link-preview image, from a running
  `npm start`), `record-demo.mjs` (project demo videos), `optimize-images.mjs`.
