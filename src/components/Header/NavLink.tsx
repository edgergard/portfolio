import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

type Props = {
  path: string;
  title: string;
  onClick?: () => void;
};

const CLASS = 'text-muted-2 transition-colors hover:text-ink';

/** Section links smooth-scroll via hash; a path starting with "/" is a route. */
const NavLink: React.FC<Props> = ({ path, title, onClick }) => {
  if (path.startsWith('/')) {
    return (
      <Link to={path} onClick={onClick} className={CLASS}>
        {title}
      </Link>
    );
  }

  return (
    <HashLink smooth to={`/#${path}`} onClick={onClick} className={CLASS}>
      {title}
    </HashLink>
  );
};

export default NavLink;
