import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type Props = { children: ReactNode; className?: string; testId?: string };

/** Fades and lifts its children in once, the first time they scroll into view. */
const Reveal = ({ children, className, testId }: Props) => (
  <motion.div
    data-testid={testId}
    className={className}
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export default Reveal;
