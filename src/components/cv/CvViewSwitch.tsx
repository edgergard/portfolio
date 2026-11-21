'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { CvDoc } from '@/data/cv';
import CvView, { type CvViewMode } from './CvView';

/**
 * Reads `?view` on the client: the web view by default, the PDF with `?view=pdf`. Render it in
 * a <Suspense> whose fallback is the web view, so the prerendered HTML holds the web CV.
 */
const CvViewSwitch = ({ doc }: { doc: CvDoc }) => {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view: CvViewMode = params.get('view') === 'pdf' ? 'pdf' : 'web';

  const setView = (next: CvViewMode) => {
    const query = new URLSearchParams(params.toString());

    if (next === 'pdf') {
      query.set('view', 'pdf');
    } else {
      query.delete('view');
    }

    const search = query.toString();

    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };

  return <CvView doc={doc} view={view} onViewChange={setView} />;
};

export default CvViewSwitch;
