import { useState } from "react";
import TabButton from "./TabButton";
import AboutList from "./AboutList";

const About = () => {
  const [selectedTab, setSelectedTab] = useState('Skills');

  return (
    <section id="about" className="pt-12 md:pt-24">
      <div className="
          flex flex-col lg:items-start
          lg:grid lg:grid-cols-2 gap-x-48 gap-y-12"
      >
        <div className="flex flex-col">
          <h2 className="mb-4 text-2xl md:text-4xl font-bold text-white">
            About Me
          </h2>

          <p className="text-lg text-white">
            I am an FS Developer with a technical background and
            proficiency in English at a B2 level.
            I possess in-depth knowledge of web development technologies,
            including Typescript, JavaScript, React.
            Furthermore, I am open to learning new technologies, such as
            Angular and Vue, to further contribute to your team. My work
            experience includes developing a Todo list application using React,
            creating a landing page for a company selling audio devices, and
            collaborating on a group project for an online store. In terms of
            soft skills, I exhibit patience, determination,
            and effective time management.
          </p>
        </div>

        <div className="flex flex-col gap-x-8 lg:h-[360px]">
          <div className="flex items-start gap-x-8 mb-2">
            <TabButton 
              selectTab={() => setSelectedTab('Skills')}
              selectedTab={selectedTab}
            >
              Skills
            </TabButton>

            <TabButton 
              selectTab={() => setSelectedTab('Education')}
              selectedTab={selectedTab}
            >
              Education
            </TabButton>
          </div>

          <AboutList selectedTab={selectedTab} />
        </div>
      </div>
    </section>
  );
};

export default About;