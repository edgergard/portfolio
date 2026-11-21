import { MotionConfig } from 'motion/react';
import { Outlet } from 'react-router';
import { ToastContainer } from 'react-toastify';
import I18nextBridge from './I18nextBridge';
import Footer from './components/layout/Footer';
import PageScrollbar from './components/layout/PageScrollbar';
import Header from './components/Header';

// Vite-era shell, removed in Task 12. The header and footer now read the Next.js I18nProvider,
// which is fed from the active i18next language so this app keeps working until then.
const App = () => (
  <I18nextBridge>
    <MotionConfig reducedMotion="user">
      <Header />
      <main className="min-h-screen bg-bg">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
      <PageScrollbar />
    </MotionConfig>
  </I18nextBridge>
);

export default App;
