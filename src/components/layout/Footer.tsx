import BackToTop from './BackToTop';
import FooterYear from './FooterYear';

/** Server Component: only the year and the back-to-top button run in the browser. */
const Footer = () => (
  <footer className="site-chrome border-t border-line bg-bg">
    <div className="mx-auto flex max-w-[1120px] flex-col gap-2 px-6 py-7 font-mono text-xs uppercase tracking-[.06em] text-muted min-[900px]:flex-row min-[900px]:justify-between min-[900px]:px-10">
      <span>© <FooterYear buildYear={new Date().getFullYear()} /> Oleksandr Bryksin</span>
      <BackToTop />
    </div>
  </footer>
);

export default Footer;
