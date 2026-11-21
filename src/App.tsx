import { MotionConfig } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { I18nProvider } from './lib/i18n-client';
import { EN, UA } from './translations';
import Footer from './components/layout/Footer';
import PageScrollbar from './components/layout/PageScrollbar';
import Header from './components/Header';

// Vite-era shell, removed in Task 12. The header and footer now read the Next.js I18nProvider,
// which is fed from the active i18next language so this app keeps working until then.
const App = () => {
  const { i18n } = useTranslation();
  const uk = i18n.language === 'ua';

  return (
    <I18nProvider lang={uk ? 'uk' : 'en'} dict={uk ? UA : EN}>
      <MotionConfig reducedMotion="user">
        <Header />
        <main className="min-h-screen bg-bg">
          <Outlet />
        </main>
        <Footer />
        <ToastContainer />
        <PageScrollbar />
      </MotionConfig>
    </I18nProvider>
  );
};

export default App;
