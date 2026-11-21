import type { StaticImageData } from 'next/image';

export type ProjectType = 'mobile' | 'web';

export type Project = {
  id: number;
  name: string;
  category: string;
  description: string;
  stack: string[];
  codelink?: string;
  demolink?: string;
  appStore?: string;
  googlePlay?: string;
  type: ProjectType;
  year: number;
  featured?: boolean;
  order?: number;
  commercial?: boolean;
  /** A bundled screenshot (static import), or a plain URL for a recorded loop's poster frame. */
  poster: StaticImageData | string;
  video?: { webm?: string; mp4?: string };
};
