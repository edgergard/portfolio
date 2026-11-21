'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = { children: ReactNode; className?: string; testId?: string };

/** How far inside the viewport an element must come before it reveals (all sides). */
export const REVEAL_ROOT_MARGIN = '-60px';

/**
 * Fades and lifts its children in once, the first time they scroll into view. The transition is
 * CSS ([data-reveal] in styles.css: 12px, 0.5s ease-out, no lift under reduced motion); this only
 * flips data-shown, so no animation library ships with the page.
 */
const Reveal = ({ children, className, testId }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);

      return undefined;
    }

    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        setShown(true);
        observer.disconnect();
      }
    }, { rootMargin: REVEAL_ROOT_MARGIN });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-testid={testId} data-reveal="" data-shown={shown ? '' : undefined} className={className}>
      {children}
    </div>
  );
};

export default Reveal;
