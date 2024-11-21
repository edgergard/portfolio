import { useState } from "react";
import TabButton from "./TabButton";
import AboutList from "./AboutList";
import { motion } from 'framer-motion';

export enum TabNames {
  Skills = 'Skills',
  Education = 'Education',
  Experience = 'Experience'
}

const About = () => {
  const [selectedTab, setSelectedTab] = useState(TabNames.Skills);

  return (
    <section id="about" className="pt-12 md:pt-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="
          flex flex-col lg:items-start
          lg:grid lg:grid-cols-2 lg:gap-x-24 xl:gap-x-48 gap-y-12"
      >
        <div className="flex flex-col">
          <h2 className="mb-4 text-2xl md:text-4xl font-bold text-white">
            About Me
          </h2>

          <p className="text-lg text-white">
            I am an FE Developer with a technical background and proficiency
            in English at a B2 level. I possess in-depth knowledge of web
            development technologies, including JavaScript, TypeScript,
            React, Redux, Tailwind, SCSS. Furthermore, I am open to learning new
            technologies, such as Angular and Vue, to further contribute
            to your team. My work experience includes developing a Todo list
            application using React, creating a landing page for a company
            selling audio devices, and collaborating on a group project for
            an online store. In terms of soft skills, I exhibit patience, 
            determination, and effective time management.
          </p>
        </div>

        <div className="flex flex-col gap-x-8 lg:h-[360px]">
          <div className="flex items-start gap-x-4 md:gap-x-8 mb-2">
            <TabButton 
              selectTab={() => setSelectedTab(TabNames.Skills)}
              selectedTab={selectedTab}
            >
              {TabNames.Skills}
            </TabButton>

            <TabButton 
              selectTab={() => setSelectedTab(TabNames.Experience)}
              selectedTab={selectedTab}
            >
              {TabNames.Experience}
            </TabButton>

            <TabButton 
              selectTab={() => setSelectedTab(TabNames.Education)}
              selectedTab={selectedTab}
            >
              {TabNames.Education}
            </TabButton>
          </div>

          <AboutList selectedTab={selectedTab} />
        </div>
      </motion.div>
    </section>
  );
};

export default About;