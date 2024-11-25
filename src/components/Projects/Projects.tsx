import { Link } from "react-router-dom";
import ProjectCardList from "./ProjectCardList";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
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

        <Link to="/archive" className="
          flex items-center gap-x-2 rounded-full group
          outline outline-button-border px-4 py-2 font-medium leading-5
          hover:outline-blood transition-all"
        >
          <p className="text-lg text-text-secondary group-hover:text-white">
            {t('archive')}
          </p>

          <ArrowRightIcon 
            className="w-6 h-6 text-text-secondary group-hover:text-white"
          />
        </Link>
      </div>

      <ProjectCardList />
    </section>
  );
};

export default Projects;