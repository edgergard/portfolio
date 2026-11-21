import { MotionConfig } from 'framer-motion';
import { Outlet } from 'react-router';
import { ToastContainer } from 'react-toastify';
import Footer from './components/layout/Footer';
import PageScrollbar from './components/layout/PageScrollbar';
import Header from './components/Header';

const App = () => {
  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main className="min-h-screen bg-bg">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
      <PageScrollbar />
    </MotionConfig>
  );
};

export default App;
