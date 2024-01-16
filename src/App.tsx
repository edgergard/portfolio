import { Outlet } from "react-router";
import Footer from "./components/Footer";
import { ToastContainer } from 'react-toastify';
import OutletContainer from "./components/OutletContainer";
import Header from "./components/Header";

const App = () => {
  return (
    <>
      <Header />
      <OutletContainer>
        <Outlet />
      </OutletContainer>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default App;
