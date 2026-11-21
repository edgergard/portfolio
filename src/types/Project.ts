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
  poster: string;
  video?: { webm?: string; mp4?: string };
};
