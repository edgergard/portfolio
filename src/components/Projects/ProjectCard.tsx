import React from 'react';
import { Project } from '../../types/Project';
import { CodeBracketIcon } from '@heroicons/react/24/solid';
import { EyeIcon } from '@heroicons/react/24/outline';

type Props = {
  project: Project;
};

const ProjectCard: React.FC<Props> = ({ project }) => {
  const { name, image, description, stack, codelink, demolink } = project;

  return (
    <div>
      <div
        className="h-72 rounded-t-xl relative group flex-grow"
        style={{
          background: `url(${image})`, 
          backgroundSize: "cover", 
          backgroundPosition: "center",
        }}
      >
        <div className=" justify-center items-center
          absolute top-0 left-0 w-full h-full 
        bg-[#181818] bg-opacity-70 hidden
          group-hover:flex" 
        > 
          <div className="flex gap-4">
            <a 
              href={codelink} 
              target="_blank" 
              rel="noreferrer"
            >
              <CodeBracketIcon 
                className="
                  w-12 h-12 p-1 border-[3px] rounded-full
                text-text-secondary hover:text-white" 
              />
            </a>

            <a 
              href={demolink} 
              target="_blank" 
              rel="noreferrer"
            >
              <EyeIcon 
                className="
                  w-12 h-12 p-1 border-[3px] rounded-full
                text-text-secondary hover:text-white" 
              />
            </a>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 rounded-b-xl"
      >
        <p className="text-2xl font-semibold pt-2 pb-1 text-white">
          {name}
        </p>

        <p className="text-text-secondary text-sm pb-4">
          {description}
        </p>
      
        <ul className="flex flex-wrap gap-2">
          {stack.map((technology) => (
            <li key={technology}>
              <div className="
                text-sm flex items-center rounded-full 
              bg-blood px-2 py-1 font-medium leading-5 text-white"
              >
                {technology}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProjectCard;