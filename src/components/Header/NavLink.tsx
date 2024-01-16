import React from 'react';
import { NavHashLink } from 'react-router-hash-link';

type Props = {
  path: string;
  title: string;
};

const NavLink: React.FC<Props> = ({ path, title }) => {
  return (
    <NavHashLink 
      to={`/#${path}`}
      smooth
      className="text-xl text-text-secondary hover:text-white transition-all"
    >
      {title}
    </NavHashLink>
  );
};

export default NavLink;