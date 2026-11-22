'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { GLASS } from '../layout/Section';
import ChunkBoundary from '../ui/ChunkBoundary';

/** Holds the form's place, same glass and height, until its code arrives. */
const FormPlaceholder = () => <div aria-hidden className={`${GLASS} min-h-[478px]`} />;

// The form (react-hook-form, zod, toastify) loads once the section nears the viewport.
const ContactForm = dynamic(() => import('./ContactForm'), { ssr: false, loading: FormPlaceholder });

/** True once the element comes within `margin` of the viewport (true at once without IntersectionObserver). */
const useNearViewport = (margin: string) => {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true);

      return undefined;
    }

    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        setNear(true);
        observer.disconnect();
      }
    }, { rootMargin: margin });

    observer.observe(el);

    return () => observer.disconnect();
  }, [margin]);

  return [ref, near] as const;
};

/** The contact form's slot: the placeholder until the section nears the viewport, then the form. */
const LazyForm = () => {
  const [ref, near] = useNearViewport('800px 0px');

  return (
    <div ref={ref}>
      {near ? (
        // If the form's code is gone (a redeploy), keep the glass box; the rows offer Telegram/email.
        <ChunkBoundary fallback={<FormPlaceholder />}>
          <ContactForm />
        </ChunkBoundary>
      ) : <FormPlaceholder />}
    </div>
  );
};

export default LazyForm;
