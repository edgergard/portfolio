import type { ReactNode } from 'react';
import { T } from '@/lib/i18n-client';
import { EMAIL, PHONE, SOCIALS, type Social } from '../../data/content';
import Reveal from '../layout/Reveal';
import Section, { GLASS } from '../layout/Section';
import CopyButton from './CopyButton';
import CvRow from './CvRow';
import { ArrowUpRightIcon, BrandIcon, PhoneIcon, type Brand } from './icons';
import LazyForm from './LazyForm';
import { CIRCLE, FOCUS, MAIN, ROW, Tile } from './rows';

const BRAND: Record<Social['id'], Brand> = {
  telegram: 'telegram',
  whatsapp: 'whatsapp',
  linkedin: 'linkedin',
  github: 'github',
  'github-alt': 'github',
};

const social = (id: Social['id']) => SOCIALS.find(s => s.id === id)!;

const Text = ({ name, handle }: { name: ReactNode; handle: string }) => (
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
      <a href={s.href} target="_blank" rel="noopener noreferrer" data-row className={`${ROW} ${FOCUS}`}>
        <Tile><BrandIcon brand={BRAND[id]} /></Tile>
        <Text name={s.label} handle={s.handle} />
        <span className={`ml-auto ${CIRCLE}`}><ArrowUpRightIcon /></span>
      </a>
    </li>
  );
};

const Group = ({ id, title, children }: { id: string; title: ReactNode; children: ReactNode }) => (
  <div className={`${GLASS} mt-6 px-5 pb-2 pt-5 min-[900px]:px-7`}>
    <h3 id={id} className="mb-1.5 font-mono text-[13px] font-normal uppercase tracking-[.07em] text-white/70">
      {title}
    </h3>
    <ul aria-labelledby={id} className="[&>li:last-child>[data-row]]:border-b-0 [&>li:last-child]:border-b-0">
      {children}
    </ul>
  </div>
);

/** The Contact section. Server Component: text comes from <T>; copy buttons, the CV row and the form are client. */
const Contact = () => (
  <Section id="contact" index={5} labelKey="section_contact" band>
    <Reveal>
      <div className="grid grid-cols-1 gap-14 min-[900px]:grid-cols-2">
        <div>
          <p className="text-[clamp(40px,5vw,72px)] font-medium leading-none tracking-[-0.045em] text-white [text-shadow:0_2px_24px_rgba(10,10,11,0.35)]">
            <T k="contact_headline" />
          </p>
          <p className="contact-lead mt-[18px] max-w-[40ch] text-[17px] leading-relaxed text-white/85"><T k="contact_lead" /></p>

          <Group id="contact-direct" title={<T k="contact_group_direct" />}>
            <li className={ROW}>
              <a href={`mailto:${EMAIL}`} className={MAIN}>
                <Tile><BrandIcon brand="gmail" /></Tile>
                <Text name={<T k="contact_email_name" />} handle={EMAIL} />
              </a>
              <CopyButton value={EMAIL} labelKey="contact_copy_email" />
            </li>
            <li className={ROW}>
              <a href={PHONE.href} className={MAIN}>
                <Tile><PhoneIcon /></Tile>
                <Text name={<T k="contact_phone_name" />} handle={PHONE.display} />
              </a>
              <CopyButton value={PHONE.e164} labelKey="contact_copy_phone" />
            </li>
            <ProfileRow id="telegram" />
            <ProfileRow id="whatsapp" />
          </Group>

          <Group id="contact-profiles" title={<T k="contact_group_profiles" />}>
            <ProfileRow id="linkedin" />
            <ProfileRow id="github" />
            <ProfileRow id="github-alt" />
            <CvRow />
          </Group>
        </div>
        <LazyForm />
      </div>
    </Reveal>
  </Section>
);

export default Contact;
