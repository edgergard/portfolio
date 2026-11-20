import ProjectCardList from "./ProjectCardList";
import { useTranslation } from "react-i18next";

const Projects = () => {
  const { t } = useTranslation();

  return (
    <section id="projects" className="pt-12 md:pt-24">
      <div className="
        flex flex-col md:flex-row justify-center items-center
        gap-x-6 gap-y-6 pb-12"
      >
        <h2 className="
          text-2xl md:text-4xl text-center text-white leading-5 font-bold"
        >
          {t('projects')}
        </h2>
      </div>

      <ProjectCardList />
    </section>
  );
};

export default Projects;