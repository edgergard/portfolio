import type { Metadata } from 'next';
import WineSurface from '@/components/Wine/WineSurface';
import { PROJECT_LIST } from '@/data/projects';
import { T } from '@/lib/i18n-client';
import ArchiveBreadcrumb from './ArchiveBreadcrumb';
import ArchiveFilters from './ArchiveFilters';

// Filled in by Task 11 (titles, descriptions, alternates).
export async function generateMetadata(): Promise<Metadata> {
  return {};
}

const years = PROJECT_LIST.map(p => p.year);
const FROM = Math.min(...years);
const TO = Math.max(...years);

/**
 * Every project in a filterable table (the home page shows only the featured few). Prerendered
 * for each locale (generateStaticParams comes from the [lang] layout); the pills and rows are
 * the client part.
 */
export default function ProjectsPage() {
  return (
    // The whole page sits on the live Wine shader: a viewport-fixed layer (one screen-sized
    // canvas, however long the list) behind everything in this isolated wrapper. .on-wine keeps
    // the dark palette on the wine in both themes; the list sits in a glass panel to stay legible.
    <div data-testid="archive-page" className="on-wine relative isolate text-ink">
      <div aria-hidden data-testid="archive-wine" className="bg-wine-flow fixed inset-0 -z-10 hover:filter-none">
        <WineSurface />
      </div>
      <div className="mx-auto max-w-[1120px] px-6 pb-20 pt-28 min-[900px]:px-10 min-[900px]:pb-[112px] min-[900px]:pt-[140px]">
        <ArchiveBreadcrumb />
        <ArchiveFilters
          heading={(
            <div>
              <h1 className="text-[clamp(44px,6vw,64px)] font-medium leading-none tracking-[-0.045em] [text-shadow:0_2px_24px_rgba(10,10,11,0.35)]">
                <T k="archive_title" />
              </h1>
              <p className="mt-3 text-base text-white/85">
                <T k="archive_summary" vars={{ count: PROJECT_LIST.length, from: FROM, to: TO }} />
              </p>
            </div>
          )}
        />
      </div>
    </div>
  );
}
