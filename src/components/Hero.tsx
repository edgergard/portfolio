import { HashLink } from 'react-router-hash-link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CV_LINK } from '../utils/constants';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section id="hero">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid lg:grid-cols-2 pt-12 md:pt-24"
      >
        <div>
          <h1 className="mb-10 text-white text-4xl md:text-7xl lg:text-[94px] font-extrabold">
            Oleksandr{" "}
            <br />
            Bryksin
          </h1>

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

      </motion.div>
    </section>
  );
};

export default Hero;