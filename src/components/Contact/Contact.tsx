import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EMAIL, SOCIALS } from '../../data/content';
import Reveal from '../layout/Reveal';
import Section from '../layout/Section';
import ContactForm from './ContactForm';

const CV_BASE = `${import.meta.env.BASE_URL}cv/`;

const CVS = [
  { key: 'contact_cv_rn', file: 'oleksandr-bryksin-react-native-cv.pdf' },
  { key: 'contact_cv_fe', file: 'oleksandr-bryksin-frontend-cv.pdf' },
];

const rowClass
  = 'flex justify-between border-b border-line py-5 text-lg transition-[padding,color] duration-300 hover:pl-3 hover:text-wine-3';
const arrowClass = 'font-mono text-xs uppercase tracking-[.06em] text-muted';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <Section id="contact" index={5} labelKey="section_contact">
      <Reveal>
        <h2 className="max-w-[14ch] text-[clamp(44px,6vw,96px)] font-medium leading-none tracking-[-0.05em]">
          {t('contact_headline')}
        </h2>
        <a
          href={`mailto:${EMAIL}`}
          className="mt-12 inline-block border-b-2 border-wine pb-1.5 text-[clamp(22px,2.4vw,34px)] font-medium tracking-[-0.02em] transition-colors hover:border-ink"
        >
          {EMAIL}
        </a>
        <div className="mt-[72px] grid grid-cols-1 gap-16 min-[900px]:grid-cols-2">
          <div>
            <div className="grid border-t border-line">
              {SOCIALS.map(s => (
                <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" className={rowClass}>
                  {s.label} <span className={arrowClass}>↗</span>
                </a>
              ))}
              {CVS.map(cv => (
                <a key={cv.key} href={CV_BASE + cv.file} download className={rowClass}>
                  {t(cv.key)} <span className={arrowClass}>↓</span>
                </a>
              ))}
            </div>
            <Link
              to="/cv"
              className="mt-8 inline-flex rounded-full border border-chip px-6 py-3.5 text-sm font-medium transition-colors hover:border-wine-2"
            >
              {t('btn_view_cv')}
            </Link>
          </div>
          <ContactForm />
        </div>
      </Reveal>
    </Section>
  );
};

export default Contact;
