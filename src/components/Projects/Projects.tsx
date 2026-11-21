import { useTranslation } from 'react-i18next';
import Section, { COLUMN } from '../layout/Section';
import Reveal from '../layout/Reveal';
import Button from '../ui/Button';
import WineSurface from '../Wine/WineSurface';
import { featuredProjects, PROJECT_LIST } from '../../data/projects';
import ProjectRow from './ProjectRow';

/**
 * Full-bleed band with the hero's live Wine shader (CSS wine-flow fill underneath) carrying the
 * featured projects in glass panels, then the link to the archive of every project.
 */
const Band = () => {
  const { t } = useTranslation();

  return (
    <div
      data-testid="projects-band"
      className="bg-wine-flow border-y border-white/10 py-12 shadow-[0_24px_80px_-32px_rgba(139,20,38,0.55)] min-[900px]:py-24"
    >
      <WineSurface />
      <div className={`relative ${COLUMN}`}>
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
            className="border-white/40 bg-[rgba(10,10,11,0.3)] backdrop-blur-sm"
          >
            {t('projects_archive_link', { count: PROJECT_LIST.length })} <span aria-hidden="true">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

const Projects = () => (
  <Section id="projects" index={4} labelKey="section_work" bleed={<Band />}>
    {null}
  </Section>
);

export default Projects;
