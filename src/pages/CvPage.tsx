// Vite-era route shim, removed in Task 12: the old router's /cv?v= route renders the Next.js
// CV view, which reads the I18nProvider that the Vite shell feeds through I18nextBridge.
import { useSearchParams } from 'react-router-dom';
import CvViewSwitch from '../components/cv/CvViewSwitch';
import { getCv } from '../data/cvs';
import { useLang } from '../lib/i18n-client';

const CvPage = () => {
  const [params] = useSearchParams();
  const variant = params.get('v') === 'frontend' ? 'frontend' : 'react-native';

  return <CvViewSwitch doc={getCv(variant, useLang())} />;
};

export default CvPage;
