import type { ReactNode } from 'react';
import { BAND, COLUMN } from '../layout/Section';
import WineSurface from '../Wine/WineSurface';

type Props = {
  children: ReactNode;
  /** Classes for the inner column, so the content lines up with the page's own column. */
  column?: string;
};

/**
 * Full-bleed band with the hero's live Wine shader; the CSS wine-flow fill shows underneath
 * while it loads or without WebGL. Holds the skills list on the home page and the web CV.
 */
const SkillsBand = ({ children, column = COLUMN }: Props) => (
  <div data-testid="skills-panel" className={`skills-band ${BAND} py-10 min-[900px]:py-14`}>
    <WineSurface />
    <div data-testid="skills-column" className={`relative ${column}`}>
      {children}
    </div>
  </div>
);

export default SkillsBand;
