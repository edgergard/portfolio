import Section from '../layout/Section';
import Reveal from '../layout/Reveal';
import { featuredProjects } from '../../data/projects';
import ProjectRow from './ProjectRow';
import ArchiveCta from './ArchiveCta';

/**
 * The whole section sits on a full-bleed band of the hero's live Wine shader (CSS wine-flow fill
 * underneath): the label, the featured projects in glass panels, then the link to the archive.
 * Server Component: the rows and the archive link are the client parts.
 */
const Projects = () => {
  return (
    <Section id="projects" index={3} labelKey="section_work" band>
      {/* auto-rows-fr: every card as tall as the tallest, all full column width. */}
      <div data-testid="project-rows" className="grid auto-rows-fr gap-7">
        {featuredProjects().map((project, i) => (
          <Reveal key={project.id} className="h-full">
            <ProjectRow project={project} index={i} reverse={i % 2 === 1} />
          </Reveal>
        ))}
      </div>
      <div className="mt-7">
        <ArchiveCta />
      </div>
    </Section>
  );
};

export default Projects;
