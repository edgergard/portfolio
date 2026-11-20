import About from '../components/About';
import Experience from '../components/Experience';
import Contact from '../components/Contact';
import Hero from '../components/Hero/Hero';
import { Projects } from '../components/Projects';
const Home = () => {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Contact />
    </>
  );
};

export default Home;