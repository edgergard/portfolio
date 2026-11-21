'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/** Honours the visitor's reduced-motion setting for every animation on the page. */
const MotionRoot = ({ children }: { children: ReactNode }) => (
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
);

export default MotionRoot;
