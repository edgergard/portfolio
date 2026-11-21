import { useTranslation } from 'react-i18next';
import Section from '../layout/Section';
import Reveal from '../layout/Reveal';
import Button from '../ui/Button';
import { featuredProjects, PROJECT_LIST } from '../../data/projects';
import ProjectRow from './ProjectRow';

/**
 * The whole section sits on a full-bleed band of the hero's live Wine shader (CSS wine-flow fill
 * underneath): the label, the featured projects in glass panels, then the link to the archive.
 */
const Projects = () => {
  const { t } = useTranslation();

  return (
    <Section id="projects" index={3} labelKey="section_work" band>
      <div className="grid gap-7">
        {featuredProjects().map((project, i) => (
          <Reveal key={project.id}>
            <ProjectRow project={project} index={i} reverse={i % 2 === 1} />
          </Reveal>
        ))}
      </div>
      <div className="mt-9 flex justify-center">
        <Button
          to="/projects"
          variant="outline"
          className="border-white/40 bg-[rgba(10,10,11,0.3)] text-white backdrop-blur-sm"
        >
          {t('projects_archive_link', { count: PROJECT_LIST.length })} <span aria-hidden="true">→</span>
        </Button>
      </div>
    </Section>
  );
};

export default Projects;
