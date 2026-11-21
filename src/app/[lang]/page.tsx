import About from '@/components/About';
import Certifications from '@/components/Certifications';
import Experience from '@/components/Experience';
import Hero from '@/components/Hero/Hero';
import { Projects } from '@/components/Projects';

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Certifications />
      {/* Task 9: Contact (still reads i18next, so it cannot render under the Next tree yet) */}
    </>
  );
}
