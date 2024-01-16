import { CodeBracketIcon } from '@heroicons/react/24/solid';
import { HashLink } from 'react-router-hash-link';
import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';

// eslint-disable-next-line max-len
const CV_LINK = 'https://drive.google.com/file/d/1sNltmCF3pG7nvT_-dacqWYB6t4hv7EAG/view?usp=sharing';

const Hero = () => {
  return (
    <section id="hero">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid lg:grid-cols-2 pt-12 md:pt-24"
      >
        <div>
          <div className="
            mb-10 text-white text-4xl md:text-7xl lg:text-8xl font-extrabold"
          >
            <h1 className="mb-4 md:mb-10 text-blood">
              {`Hello, I'm`}
            </h1>

            <TypeAnimation
              sequence={[
                "Oleksandr",
                1000,
                'FE Developer',
                1000
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>

          <p className="text-text-secondary text-xl mb-8">
            Always looking for new opportunities and interesting tasks.
          </p>

          <div className="flex gap-4">
            <HashLink
              smooth
              to="/#contact"
              className="
                flex items-center rounded-full group
                bg-button-main px-8 py-4 font-medium leading-5
                transition-all text-white hover:bg-blood"
            >
              Hire me
            </HashLink>

            <a
              href={CV_LINK}
              target='_blank'
              rel="noreferrer"
              className="
                flex items-center rounded-full group transition-all
                outline outline-button-border px-6 py-3 font-medium leading-5
              hover:outline-blood text-text-secondary hover:text-white"
            >
              Open CV 
            </a>
          </div>
        </div>

        <div className="
          hidden lg:flex items-center ml-40
          w-[320px] h-[320px] xl:w-[400px] xl:h-[400px]
          rounded-full justify-center bg-hero-icon-bg"
        >
          <CodeBracketIcon className="
            w-[200px] h-[200px] xl:w-[300px] xl:h-[300px] text-white"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;