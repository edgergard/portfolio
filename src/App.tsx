import { Outlet } from 'react-router';
import { ToastContainer } from 'react-toastify';
import Footer from './components/layout/Footer';
import Header from './components/Header';

const App = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default App;
