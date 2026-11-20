import { useSearchParams } from 'react-router-dom';
import type { CvVariant } from '../../data/cv';

export type CvView = 'web' | 'pdf';

const VARIANTS: CvVariant[] = ['react-native', 'frontend'];
const VIEWS: CvView[] = ['web', 'pdf'];

export const useCvParams = () => {
  const [params, setParams] = useSearchParams();

  const variant = VARIANTS.find(v => v === params.get('v')) ?? 'react-native';
  const view = VIEWS.find(v => v === params.get('view')) ?? 'web';

  const update = (key: 'v' | 'view', value: string) => {
    const next = new URLSearchParams(params);

    next.set(key, value);
    setParams(next, { replace: true });
  };

  return {
    variant,
    view,
    setVariant: (v: CvVariant) => update('v', v),
    setView: (v: CvView) => update('view', v),
  };
};
