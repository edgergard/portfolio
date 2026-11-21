'use client';

import type { ReactNode } from 'react';
import * as m from 'motion/react-m';

type Props = { children: ReactNode; className?: string; testId?: string };

/** Fades and lifts its children in once, the first time they scroll into view. */
const Reveal = ({ children, className, testId }: Props) => (
  <m.div
    data-testid={testId}
    className={className}
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    {children}
  </m.div>
);

export default Reveal;
