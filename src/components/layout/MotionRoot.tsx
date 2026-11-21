'use client';

import { LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';

const loadFeatures = () => import('./motionFeatures').then(mod => mod.default);

/**
 * Honours the visitor's reduced-motion setting for every animation on the page. The animation
 * features load lazily (LazyMotion), so only the small `m` components are in the first load;
 * `strict` makes a stray full `motion.*` component throw.
 */
const MotionRoot = ({ children }: { children: ReactNode }) => (
  <MotionConfig reducedMotion="user">
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  </MotionConfig>
);

export default MotionRoot;
