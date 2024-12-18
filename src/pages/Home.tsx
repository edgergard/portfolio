import About from '../components/About';
import Contact from '../components/Contact';
import Hero from '../components/Hero';
import { Projects } from '../components/Projects';
const Home = () => {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Contact />
    </>
  );
};

export default Home;