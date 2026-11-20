import { CVS, type CvDoc, type CvVariant } from './cv';
import { CVS_UA } from './cv.ua';

export const isUa = (lang: string): boolean => lang.startsWith('ua') || lang.startsWith('uk');

export const getCv = (variant: CvVariant, lang: string): CvDoc =>
  (isUa(lang) ? CVS_UA : CVS)[variant];
