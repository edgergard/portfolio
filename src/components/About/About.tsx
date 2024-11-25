import { useState } from "react";
import TabButton from "./TabButton";
import AboutList from "./AboutList";
import { motion } from 'framer-motion';
import { useTranslation } from "react-i18next";

export enum TabNames {
  Skills = 0,
  Education = 1,
  Experience = 2
}

const About = () => {
  const { t } = useTranslation();
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
            {t('about_me')}
          </h2>

          <p className="text-lg text-white">
            {t('about_me_description')}
          </p>
        </div>

        <div className="flex flex-col gap-x-8 lg:h-[360px]">
          <div className="flex items-start gap-x-4 md:gap-x-8 mb-2">
            <TabButton 
              selectTab={() => setSelectedTab(TabNames.Skills)}
              selectedTab={selectedTab}
              id={TabNames.Skills}
            >
              {t('skills')}
            </TabButton>

            <TabButton 
              selectTab={() => setSelectedTab(TabNames.Experience)}
              selectedTab={selectedTab}
              id={TabNames.Experience}
            >
              {t('experience')}
            </TabButton>

            <TabButton 
              selectTab={() => setSelectedTab(TabNames.Education)}
              selectedTab={selectedTab}
              id={TabNames.Education}
            >
              {t('education')}
            </TabButton>
          </div>

          <AboutList selectedTabId={selectedTab} />
        </div>
      </motion.div>
    </section>
  );
};

export default About;