import { ArrowLeftIcon } from '@heroicons/react/24/solid';

import { HashLink } from 'react-router-hash-link';
import { ProjectsCardList } from '../components/Projects';
import { useEffect } from 'react';
import { scrollTop } from '../utils/helpers';

const Archive = () => {
  useEffect(() => scrollTop());

  return (
    <div className="pt-12 md:pt-24">
      <div className="
        flex flex-col md:flex-row items-center justify-center 
        gap-x-6 gap-y-6 pb-8 md:pb-12"
      >
        <HashLink to="/#projects" className="
          flex items-center gap-x-2 rounded-full group
          outline outline-button-border px-4 py-2 font-medium leading-5
        hover:outline-blood transition-all"
        >
          <ArrowLeftIcon 
            className="w-6 h-6 text-text-secondary group-hover:text-white"
          />

          <p className="text-lg text-text-secondary group-hover:text-white">
            Home
          </p>
        </HashLink>

        <h1 className="text-white text-2xl md:text-4xl font-bold">
          Projects Archive
        </h1>
      </div>

      <ProjectsCardList />
    </div>
  );
};

export default Archive;