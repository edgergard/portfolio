import type { Metadata } from 'next';
import About from '@/components/About';
import Certifications from '@/components/Certifications';
import Contact from '@/components/Contact';
import Experience from '@/components/Experience';
import Hero from '@/components/Hero/Hero';
import { Projects } from '@/components/Projects';
import PersonJsonLd from '@/components/seo/PersonJsonLd';
import { getDictionary } from '@/lib/dictionaries';
import { DEFAULT_LANG, isLang } from '@/lib/locale';
import { pageMetadata } from '@/lib/metadata';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = isLang(raw) ? raw : DEFAULT_LANG;

  return pageMetadata(lang, 'home', await getDictionary(lang));
}

export default function HomePage() {
  return (
    <>
      <PersonJsonLd />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Certifications />
      <Contact />
    </>
  );
}
