import React from "react";
import { EDUCATION, EXPERIENCE, SKILLS } from "../../data/data";
import { TabNames } from "./About";
import { useTranslation } from "react-i18next";

type Props = {
  selectedTabId: number;
};

const AboutList: React.FC<Props> = ({ selectedTabId }) => {
  const { t } = useTranslation();

  if (selectedTabId === TabNames.Skills) {
    return (
      <>
        <ul className="mt-2 mb-6 flex flex-wrap max-w-96">
          {SKILLS.map((skill) => (
            <li key={skill} className="mr-2 mt-3">
              <div
                className="
              md:text-lg flex items-center rounded-full 
            bg-blood px-4 py-2 font-medium leading-5 text-white"
              >
                {skill}
              </div>
            </li>
          ))}
        </ul>

        <div
          className="
        flex flex-wrap items-center gap-x-4 gap-y-2 
        text-2xl text-white font-semibold"
        >
          {t('english')}
          <div
            className="
          text-base md:text-lg flex items-center rounded-full 
        bg-blood px-4 py-2 font-medium leading-5 text-white"
          >
            Upper-Intermediate
          </div>
        </div>
      </>
    );
  }

  if (selectedTabId === TabNames.Education) {
    return (
      <ul className="flex flex-col gap-y-8 mt-5 mb-6 text-lg text-white">
        {EDUCATION.map((ed) => (
          <li
            key={ed.period}
            className="flex flex-col items-start gap-x-16 gap-y-4"
          >
            <div
              className="
            text-base md:text-lg flex items-center rounded-full
            bg-blood px-4 py-2 font-medium leading-5 text-white"
            >
              {t(ed.period)}
            </div>

            <p className="lg:w-96 ml-2">{t(ed.place)}</p>
          </li>
        ))}
      </ul>
    );
  }

  if (selectedTabId === TabNames.Experience) {
    return (
      <ul className="flex flex-col gap-y-8 mt-5 mb-6 text-lg text-white">
        {EXPERIENCE.map((exp) => (
          <li
            key={exp.period}
            className="flex flex-col items-start gap-x-16 gap-y-4"
          >
            <div
              className="
              text-base md:text-lg flex items-center rounded-full
              bg-blood px-4 py-2 font-medium leading-5 text-white"
            >
              {t(exp.period)}
            </div>

            <p className="text-2xl ml-2 font-semibold">
              {exp.place} - {exp.spec}
            </p>
          </li>
        ))}
      </ul>
    );
  }
};

export default AboutList;
