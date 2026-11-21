import { T } from '@/lib/i18n-client';
import Button from '../ui/Button';
import { PROJECT_COUNT } from '../../data/content';
import HeroVisual from './HeroVisual';

/** Green "available" dot with a soft ring. */
export const OpenDot = () => (
  <i
    aria-hidden
    data-testid="open-dot"
    className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#22C55E] shadow-[0_0_0_4px_rgba(34,197,94,.22)]"
  />
);

const OpenToWork = () => (
  <span className="inline-flex w-max items-center gap-2.5 rounded-full border border-[rgba(34,197,94,.35)] bg-[rgba(34,197,94,.08)] px-3.5 py-2 text-[15px] leading-none text-open">
    <OpenDot />
    <T k="hero_open" />
  </span>
);

/** Hero facts summary: [label key, figure, unit key]. The About section has the full facts. */
const FACTS = [
  ['hero_fact_experience', '2.5+', 'fact_experience_unit'],
  ['fact_apps_label', '5', 'fact_apps_unit'],
  ['fact_projects_label', PROJECT_COUNT, 'fact_projects_unit'],
  ['fact_english_label', 'C1', 'hero_fact_english_unit'],
] as const;

/** Swiss-style key/value table with hairline rows. */
const Facts = () => (
  <table data-testid="hero-facts" className="mb-8 w-full max-w-[520px] border-collapse min-[900px]:mb-[34px]">
    <tbody>
      {FACTS.map(([label, figure, unit]) => (
        <tr key={label} className="border-y border-line">
          <th
            scope="row"
            className="py-3.5 pr-4 min-[900px]:w-[45%] text-left leading-tight align-baseline font-mono text-xs font-normal uppercase tracking-[.08em] text-ink-2"
          >
            <T k={label} />
          </th>
          <td className="whitespace-nowrap py-3.5 text-right align-baseline leading-tight text-[20px] font-medium tracking-[-.02em] text-ink min-[900px]:text-[22px]">
            {figure}
            <small className="ml-1.5 text-[13px] min-[400px]:text-[15px] font-normal tracking-normal text-ink-2"><T k={unit} /></small>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

/** Document glyph before the View CV label. */
const DocIcon = () => (
  <svg
    aria-hidden
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
    <path d="M8 13h8M8 17h5" />
  </svg>
);

/**
 * The home page's first screen. Server Component: the text column is static HTML; the buttons,
 * the translated strings and the 3D panel (HeroVisual) are client leaves.
 */
const Hero = () => (
  <section
    id="hero"
    className="relative flex flex-col bg-bg text-ink min-[900px]:h-[calc(100svh-72px)] min-[900px]:min-h-[640px]"
  >
    <div className="grid min-h-0 flex-1 grid-cols-1 min-[900px]:grid-cols-[1.05fr_1fr]">
      <div className="flex flex-col justify-center px-6 pb-10 pt-8 min-[900px]:py-8 min-[900px]:pl-10 min-[900px]:pr-12">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-4 min-[900px]:mb-[34px]">
          <p className="flex items-center gap-3 font-mono text-[13px] uppercase tracking-[.06em] text-soft">
            <i aria-hidden className="inline-block h-0.5 w-8 shrink-0 bg-wine-3" />
            <T k="hero_eyebrow" />
          </p>
          <OpenToWork />
        </div>

        <h1 className="mb-[18px] text-[clamp(56px,6.4vw,92px)] font-medium leading-[.92] tracking-[-.05em]">
          <span className="block pb-[.06em]">Oleksandr</span>{' '}
          <span className="block pb-[.06em]">Bryksin</span>
        </h1>

        <p className="mb-8 max-w-[640px] text-lg leading-[1.35] text-soft min-[900px]:mb-[34px] min-[900px]:text-[20px]">
          <T k="hero_lede" />
        </p>

        <Facts />

        <div className="flex flex-wrap items-center gap-3">
          <Button to="/#experience" size="lg">
            <T k="btn_view_experience" />
            <span aria-hidden>→</span>
          </Button>
          <Button to="/cv/react-native" variant="edge" size="lg">
            <DocIcon />
            <T k="btn_view_cv" />
          </Button>
        </div>
      </div>

      <HeroVisual />
    </div>
  </section>
);

export default Hero;
