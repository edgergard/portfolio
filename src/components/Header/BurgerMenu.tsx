import React from 'react';
import NavLink from './NavLink';
import LocaleButton from './LocaleButton';

type Props = {
  links: {title: string, path: string }[];
  onLinkClick: () => void;
};

const BurgerMenu: React.FC<Props> = ({ links, onLinkClick }) => {
  return (
    <div className="flex flex-col items-center gap-y-4  ">
      <LocaleButton />

      <ul className="md:hidden flex gap-x-8 items-center">
        {links.map(({title, path}, index) => (
          <li key={index} >
            <NavLink title={title} path={path} onClick={onLinkClick} />
          </li>
        ))}
      </ul>
    </div>

  );
};

export default BurgerMenu;