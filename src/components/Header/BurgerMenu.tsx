import React from 'react';
import NavLink from './NavLink';

type Props = {
  links: {title: string, path: string }[];
};

const BurgerMenu: React.FC<Props> = ({ links }) => {
  return (
    <ul className="md:hidden flex gap-x-8 items-center">
      {links.map(({title, path}, index) => (
        <li key={index} >
          <NavLink title={title} path={path}/>
        </li>
      ))}
    </ul>
  );
};

export default BurgerMenu;