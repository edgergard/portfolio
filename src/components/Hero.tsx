import { HashLink } from 'react-router-hash-link';
import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import { ReactLogo } from '../images';
import { useTranslation } from 'react-i18next';
import { CV_LINK } from '../utils/constants';

const Hero = () => {
  const { t, i18n } = useTranslation();

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
            mb-10 text-white text-4xl md:text-7xl lg:text-[94px] font-extrabold"
          >
            <h1 className="mb-4 md:mb-10 text-blood">
              {t('hello')}
            </h1>

            <TypeAnimation
              key={i18n.language}
              sequence={[
                t('name'),
                1000,
                t('occupation'),
                1000
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>

          <p className="text-text-secondary text-xl mb-8">
            {t('always_looking_for')}
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
              {t('hire_me')}
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
              {t('open_cv')}
            </a>
          </div>
        </div>

        <div className="
          hidden lg:flex items-center ml-40
          size-[360px] xl:size-[460px]
          rounded-full justify-center bg-hero-icon-bg"
        >
          <img src={ReactLogo} />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;