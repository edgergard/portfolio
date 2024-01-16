import ProjectCard from './ProjectCard';
import { Project } from '../../types/Project';
import { GadgetLuxe, RickAndMorty, PokeAPI, BAndQ, Todo } from '../../images';

export const PROJECT_LIST: Project[] = [
  {
    id: 1,
    name: "Gadget Luxe",
    image: GadgetLuxe,
    description: "An online phone store with full-stack capabilities.",
    stack: ["React", "Typescript", "SCSS", "Node.js"],
    codelink: "https://github.com/fe-jul23-CodeDynasty/product_catalog",
    demolink: "https://fe-jul23-codedynasty.github.io/product_catalog/",
  },
  {
    id: 2,
    name: "Rick and Morty API app",
    image: RickAndMorty,
    description: "Implementation of open source Rick and Morty API.",
    stack: ["React", "Typescript", "Redux", "GraphQL", "MUI"],
    codelink: "https://github.com/edgergard/Rick-and-morty-fe",
    demolink: "https://edgergard.github.io/Rick-and-morty-fe/",
  },
  {
    id: 3,
    name: "PokeAPI task",
    image: PokeAPI,
    description: "Implementation of open source PokeAPI.",
    stack: ["React", "Typescript", "Tailwind", "Axios"],
    codelink: "https://github.com/edgergard/pokeAPI",
    demolink: "https://edgergard.github.io/pokeAPI/",
  },
  {
    id: 4,
    name: "Landing page for B&Q",
    image: BAndQ,
    description: "Visually appealing and user-friendly landing page.",
    stack: ["HTML5", "SCSS", "BEM",],
    codelink: "https://github.com/edgergard/B-Q-Landing",
    demolink: "https://edgergard.github.io/B-Q-Landing/",
  },
  {
    id: 5,
    name: "React Todo app",
    image: Todo,
    description: "Simple task-management app with API.",
    stack: ["React", "Typescript", "SCSS"],
    codelink: "https://github.com/edgergard/react-todo-app",
    demolink: "https://edgergard.github.io/react_todo-app-with-api/",
  },

];

const ProjectCardList = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
      {PROJECT_LIST.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectCardList;