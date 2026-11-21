'use client';

import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { useT } from '@/lib/i18n-client';
import BurgerMenu from './BurgerMenu';
import NavLink, { SectionLink } from './NavLink';
import LocaleButton from './LocaleButton';
import ThemeButton from './ThemeButton';

const Header = () => {
  const t = useT();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NAV_LINKS = [
    { title: t('nav_work'), path: 'projects' },
    { title: t('nav_experience'), path: 'experience' },
    { title: t('nav_about'), path: 'about' },
    { title: t('nav_contact'), path: 'contact' },
    { title: t('nav_cv'), path: '/cv' },
  ];

  return (
    <header className="site-chrome sticky top-0 z-50 w-full border-b border-line bg-bg font-mono text-xs uppercase tracking-[.06em] text-ink">
      <div className="flex h-[72px] items-center justify-between px-6 min-[900px]:px-10">
        <SectionLink section="hero" className="text-ink" data-testid="brand">
          Oleksandr Bryksin
        </SectionLink>

        <nav className="hidden items-center gap-x-8 min-[900px]:flex">
          <ul className="flex gap-x-8">
            {NAV_LINKS.map(({ title, path }) => (
              <li key={path}>
                <NavLink title={title} path={path} />
              </li>
            ))}
          </ul>
          <LocaleButton />
          <ThemeButton />
        </nav>

        <div className="flex items-center gap-4 min-[900px]:hidden">
          <ThemeButton />
          <button
            type="button"
            className="min-[900px]:hidden"
            aria-label={isMenuOpen ? t('nav_menu_close') : t('nav_menu_open')}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-ink" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-ink" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="min-[900px]:hidden">
          <BurgerMenu links={NAV_LINKS} onLinkClick={() => setIsMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};

export default Header;
