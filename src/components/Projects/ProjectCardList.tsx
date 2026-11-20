import ProjectCard from './ProjectCard';
import { PROJECT_LIST } from '../../data/projects';

const ProjectCardList = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
      {PROJECT_LIST.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectCardList;