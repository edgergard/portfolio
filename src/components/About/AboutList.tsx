import React from 'react';
import { EDUCATION, SKILLS } from '../../utils/data';

type Props = {
  selectedTab: string;
};

const AboutList: React.FC<Props> = ({ selectedTab }) => {
  return selectedTab === 'Skills' ? (
    <>
      <ul className="mt-2 mb-6 flex flex-wrap max-w-96">
        {SKILLS.map((skill) => (
          <li key={skill} className="mr-2 mt-3">
            <div className="
              md:text-lg flex items-center rounded-full 
            bg-blood px-4 py-2 font-medium leading-5 text-white"
            >
              {skill}
            </div>
          </li>
        ))}
      </ul>
      
      <div className="
        flex flex-wrap items-center gap-x-4 gap-y-2 
        text-2xl text-white font-semibold"
      >
        English

        <div className="
          text-base md:text-lg flex items-center rounded-full 
        bg-blood px-4 py-2 font-medium leading-5 text-white"
        >
          Upper-Intermediate
        </div>
      </div>
    </>
  ) : (
    <ul className="flex flex-col gap-y-8 mt-2 mb-6 text-lg text-white">
      {EDUCATION.map((ed) => (
        <li 
          key={ed.period} 
          className="
            flex flex-col items-start
            md:items-center md:flex-row gap-x-16 gap-y-8"
        >
          <p className="
            text-base md:text-lg flex items-center rounded-full
            bg-blood px-4 py-2 font-medium leading-5 text-white"
          >
            {ed.period}
          </p>

          <p className="lg:w-64">
            {ed.place}
          </p>
        </li>
      ))}
    </ul>
  );
};

export default AboutList;