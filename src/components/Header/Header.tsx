import classNames from 'classnames';
import { Bars3Icon, HomeIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { HashLink } from 'react-router-hash-link';
import { useState } from 'react';
import BurgerMenu from './BurgerMenu';
import NavLink from './NavLink';

const NAV_LINKS = [
  {
    title: 'About',
    path: 'about',
  },
  {
    title: 'Projects',
    path: 'projects',
  },
  {
    title: 'Contact',
    path: 'contact',
  }
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav
      className="
        sticky top-0 z-50 w-full py-4 px-8 md:px-24
        flex flex-col items-center justify-between
      bg-background border-b-[1px] border-header-border"
    >
      <div className={
        classNames('flex md:mb-0 items-center justify-between w-full', {
          'mb-6': isMenuOpen,
        })}>
        <HashLink smooth to="/#hero">
          <HomeIcon className="
            w-8 h-8 md:w-12 md:h-12 text-white"
          />
        </HashLink>

        <div className="block md:hidden">
          {isMenuOpen ? (
            <button onClick={() => setIsMenuOpen(false)}>
              <XMarkIcon className="h-8 w-8 text-white mt-2"/>
            </button>
          ) : (
            <button onClick={() => setIsMenuOpen(true)}>
              <Bars3Icon className="h-8 w-8 text-white mt-2"/>
            </button>
          )}
        </div>

        <div className="hidden md:block">
          <ul className="flex gap-8">
            {NAV_LINKS.map(({title, path}, index) => (
              <li key={index}>
                <NavLink title={title} path={path} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isMenuOpen && <BurgerMenu links={NAV_LINKS} />}
    </nav>
  );
};

export default Header;