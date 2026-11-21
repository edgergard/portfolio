'use client';

import React from 'react';
import NavLink from './NavLink';
import LocaleButton from './LocaleButton';

type Props = {
  links: { title: string; path: string }[];
  onLinkClick: () => void;
};

const BurgerMenu: React.FC<Props> = ({ links, onLinkClick }) => (
  <div className="flex w-full flex-col gap-y-5 border-t border-line px-6 py-6 font-mono text-xs uppercase tracking-[.06em]">
    <ul className="flex flex-col gap-y-5">
      {links.map(({ title, path }) => (
        <li key={path}>
          <NavLink title={title} path={path} onClick={onLinkClick} />
        </li>
      ))}
    </ul>
    <LocaleButton />
  </div>
);

export default BurgerMenu;
