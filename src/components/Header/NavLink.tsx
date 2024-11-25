import React from 'react';
import { NavHashLink } from 'react-router-hash-link';

type Props = {
  path: string;
  title: string;
  onClick?: () => void;
};

const NavLink: React.FC<Props> = ({ path, title, onClick }) => {
  return (
    <NavHashLink
      onClick={onClick}
      to={`/#${path}`}
      smooth
      className="text-xl text-text-secondary hover:text-white transition-all"
    >
      {title}
    </NavHashLink>
  );
};

export default NavLink;