import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EMAIL, PHONE, SOCIALS, type Social } from '../../data/content';
import Reveal from '../layout/Reveal';
import Section, { GLASS } from '../layout/Section';
import ContactForm from './ContactForm';
import CopyButton from './CopyButton';
import { ArrowDownIcon, ArrowUpRightIcon, BrandIcon, DocumentIcon, PhoneIcon, type Brand } from './icons';

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

const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
// Every row's bottom hairline has the same rounded ends, whether the row is a link or a list item.
const ROW = 'group flex items-center gap-3 sm:gap-3.5 rounded-lg border-b border-white/10 py-3';
const MAIN = `flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5 rounded-lg ${FOCUS}`;

/** Round action on the right of a row; brightens with a wine border when the row is hovered. */
const CIRCLE
  = 'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/25 text-white/90 '
  + 'transition-colors duration-200 group-hover:border-white group-hover:bg-white/10 group-hover:text-white';

const Tile = ({ children }: { children: ReactNode }) => (
  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-white/10 bg-white/[.06] text-white">
    {children}
  </span>
);

const Text = ({ name, handle }: { name: string; handle: string }) => (
  <span className="grid min-w-0">
    <span className="text-[17px] leading-snug text-white">{name}</span>
    <span className="font-mono text-[11px] text-white/60 [overflow-wrap:anywhere] min-[420px]:text-[13px]">{handle}</span>
  </span>
);

/** A whole-row link that opens a profile in a new tab. */
const ProfileRow = ({ id }: { id: Social['id'] }) => {
  const s = social(id);

  return (
    <li>
      <a href={s.href} target="_blank" rel="noopener noreferrer" className={`${ROW} ${FOCUS}`}>
        <Tile><BrandIcon brand={BRAND[id]} /></Tile>
        <Text name={s.label} handle={s.handle} />
        <span className={`ml-auto ${CIRCLE}`}><ArrowUpRightIcon /></span>
      </a>
    </li>
  );
};

const Group = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <div className={`${GLASS} mt-6 px-5 pb-2 pt-5 min-[900px]:px-7`}>
    <h3 id={id} className="mb-1.5 font-mono text-[13px] font-normal uppercase tracking-[.07em] text-white/70">
      {title}
    </h3>
    <ul aria-labelledby={id} className="[&>li:last-child>a]:border-b-0 [&>li:last-child]:border-b-0">
      {children}
    </ul>
  </div>
);

const Contact = () => {
  const { t } = useTranslation();

  return (
    <Section id="contact" index={5} labelKey="section_contact" band>
      <Reveal>
        <div className="grid grid-cols-1 gap-14 min-[900px]:grid-cols-2">
          <div>
            <p className="text-[clamp(40px,5vw,72px)] font-medium leading-none tracking-[-0.045em] text-white [text-shadow:0_2px_24px_rgba(10,10,11,0.35)]">
              {t('contact_headline')}
            </p>
            <p className="mt-[18px] max-w-[40ch] text-[17px] leading-relaxed text-white/85">{t('contact_lead')}</p>

            <Group id="contact-direct" title={t('contact_group_direct')}>
              <li className={ROW}>
                <a href={`mailto:${EMAIL}`} className={MAIN}>
                  <Tile><BrandIcon brand="gmail" /></Tile>
                  <Text name={t('contact_email_name')} handle={EMAIL} />
                </a>
                <CopyButton value={EMAIL} labelKey="contact_copy_email" />
              </li>
              <li className={ROW}>
                <a href={PHONE.href} className={MAIN}>
                  <Tile><PhoneIcon /></Tile>
                  <Text name={t('contact_phone_name')} handle={PHONE.display} />
                </a>
                <CopyButton value={PHONE.e164} labelKey="contact_copy_phone" />
              </li>
              <ProfileRow id="telegram" />
              <ProfileRow id="whatsapp" />
            </Group>

            <Group id="contact-profiles" title={t('contact_group_profiles')}>
              <ProfileRow id="linkedin" />
              <ProfileRow id="github" />
              <ProfileRow id="github-alt" />
              {/* Not one link (two downloads and the page link), so no row-wide hover on the arrow. */}
              <li className={ROW.replace('group ', '')}>
                <Tile><DocumentIcon /></Tile>
                <span className="grid min-w-0 flex-1 gap-1.5">
                  <span className="text-[17px] leading-snug text-white">{t('contact_cv_name')}</span>
                  <span className="flex flex-wrap gap-2">
                    {CVS.map(cv => (
                      <a
                        key={cv.key}
                        href={CV_BASE + cv.file}
                        download
                        aria-label={`${t(cv.key)}, ${t('contact_cv_pdf')}`}
                        className={
                          'inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1 font-mono '
                          + `text-[13px] text-white/90 transition-colors hover:border-white hover:bg-white/10 hover:text-white ${FOCUS}`
                        }
                      >
                        <ArrowDownIcon />
                        {t(cv.shortKey)}
                        <span className="text-white/60">{t('contact_cv_pdf')}</span>
                      </a>
                    ))}
                  </span>
                </span>
                <Link
                  to="/cv"
                  aria-label={t('btn_view_cv')}
                  className={`${CIRCLE} ${FOCUS} hover:border-white hover:bg-white/10`}
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
