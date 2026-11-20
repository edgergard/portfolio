import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EMAIL, SOCIALS, type Social } from '../../data/content';
import Reveal from '../layout/Reveal';
import Section from '../layout/Section';
import ContactForm from './ContactForm';
import CopyButton from './CopyButton';
import { ArrowDownIcon, ArrowUpRightIcon, BrandIcon, DocumentIcon, type Brand } from './icons';

const CV_BASE = `${import.meta.env.BASE_URL}cv/`;

const CVS = [
  { key: 'contact_cv_rn', shortKey: 'contact_cv_rn_short', file: 'oleksandr-bryksin-react-native-cv.pdf' },
  { key: 'contact_cv_fe', shortKey: 'contact_cv_fe_short', file: 'oleksandr-bryksin-frontend-cv.pdf' },
];

const BRAND: Record<Social['id'], Brand> = {
  telegram: 'telegram',
  whatsapp: 'whatsapp',
  linkedin: 'linkedin',
  github: 'github',
  'github-alt': 'github',
};

const social = (id: Social['id']) => SOCIALS.find(s => s.id === id)!;

const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';
const ROW = 'group flex items-center gap-3 sm:gap-3.5 border-b border-line py-3';
const MAIN = `flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5 rounded-lg ${FOCUS}`;

/** Round action on the right of a row; brightens with a wine border when the row is hovered. */
const CIRCLE
  = 'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#3A3A40] text-[#E6E6EA] '
  + 'transition-colors duration-200 group-hover:border-wine-2 group-hover:text-ink';

const Tile = ({ children }: { children: ReactNode }) => (
  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-[#232327] bg-[#161618] text-ink">
    {children}
  </span>
);

const Text = ({ name, handle }: { name: string; handle: string }) => (
  <span className="grid min-w-0">
    <span className="text-[17px] leading-snug">{name}</span>
    <span className="font-mono text-[11px] text-muted-2 [overflow-wrap:anywhere] min-[420px]:text-[13px]">{handle}</span>
  </span>
);

/** A whole-row link that opens a profile in a new tab. */
const ProfileRow = ({ id }: { id: Social['id'] }) => {
  const s = social(id);

  return (
    <li>
      <a href={s.href} target="_blank" rel="noopener noreferrer" className={`${ROW} rounded-lg ${FOCUS}`}>
        <Tile><BrandIcon brand={BRAND[id]} /></Tile>
        <Text name={s.label} handle={s.handle} />
        <span className={`ml-auto ${CIRCLE}`}><ArrowUpRightIcon /></span>
      </a>
    </li>
  );
};

const Group = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <div className="mt-9">
    <h3 id={id} className="mb-2.5 font-mono text-[13px] font-normal uppercase tracking-[.07em] text-ink-2">
      {title}
    </h3>
    <ul aria-labelledby={id} className="border-t border-line">
      {children}
    </ul>
  </div>
);

const Contact = () => {
  const { t } = useTranslation();
  const whatsapp = social('whatsapp');

  return (
    <Section id="contact" index={5} labelKey="section_contact">
      <Reveal>
        <div className="grid grid-cols-1 gap-14 min-[900px]:grid-cols-2">
          <div>
            <p className="text-[clamp(40px,5vw,72px)] font-medium leading-none tracking-[-0.045em]">
              {t('contact_headline')}
            </p>
            <p className="mt-[18px] max-w-[40ch] text-[17px] leading-relaxed text-ink-2">{t('contact_lead')}</p>

            <Group id="contact-direct" title={t('contact_group_direct')}>
              <li className={ROW}>
                <a href={`mailto:${EMAIL}`} className={MAIN}>
                  <Tile><BrandIcon brand="gmail" /></Tile>
                  <Text name={t('contact_email_name')} handle={EMAIL} />
                </a>
                <CopyButton value={EMAIL} labelKey="contact_copy_email" />
              </li>
              <ProfileRow id="telegram" />
              <li className={ROW}>
                <Tile><BrandIcon brand="whatsapp" /></Tile>
                <span className="flex min-w-0 flex-1">
                  <Text name={whatsapp.label} handle={whatsapp.handle} />
                </span>
                <CopyButton value={whatsapp.handle} labelKey="contact_copy_whatsapp" />
              </li>
            </Group>

            <Group id="contact-profiles" title={t('contact_group_profiles')}>
              <ProfileRow id="linkedin" />
              <ProfileRow id="github" />
              <ProfileRow id="github-alt" />
              <li className={ROW}>
                <Tile><DocumentIcon /></Tile>
                <span className="grid min-w-0 flex-1 gap-1.5">
                  <span className="text-[17px] leading-snug">{t('contact_cv_name')}</span>
                  <span className="flex flex-wrap gap-2">
                    {CVS.map(cv => (
                      <a
                        key={cv.key}
                        href={CV_BASE + cv.file}
                        download
                        aria-label={`${t(cv.key)}, ${t('contact_cv_pdf')}`}
                        className={
                          'inline-flex items-center gap-1.5 rounded-full border border-[#3A3A40] px-3 py-1 font-mono '
                          + `text-[13px] text-[#E6E6EA] transition-colors hover:border-wine-2 hover:text-ink ${FOCUS}`
                        }
                      >
                        <ArrowDownIcon />
                        {t(cv.shortKey)}
                        <span className="text-muted-2">{t('contact_cv_pdf')}</span>
                      </a>
                    ))}
                  </span>
                </span>
                <Link
                  to="/cv"
                  aria-label={t('btn_view_cv')}
                  className={`${CIRCLE} ${FOCUS} hover:border-wine-2 hover:text-ink`}
                >
                  <ArrowUpRightIcon />
                </Link>
              </li>
            </Group>
          </div>
          <ContactForm />
        </div>
      </Reveal>
    </Section>
  );
};

export default Contact;
