import Section from '../layout/Section';
import Reveal from '../layout/Reveal';
import { PROJECT_LIST } from '../../data/projects';
import ProjectRow from './ProjectRow';

const Projects = () => (
  <Section id="projects" index={4} labelKey="section_work">
    <div className="grid gap-24">
      {PROJECT_LIST.map((project, i) => (
        <Reveal key={project.id}>
          <ProjectRow project={project} index={i} reverse={i % 2 === 1} />
        </Reveal>
      ))}
    </div>
  </Section>
);

export default Projects;
