import { describe, expect, it } from 'vitest';
import en from '../translations/en.json';
import ua from '../translations/ua.json';
import {
  CERTIFICATES,
  EDUCATION,
  FACTS,
  JOBS,
  PHONE,
  SKILLS,
  SOCIALS,
} from './content';

describe('content data', () => {
  it('lists the jobs in order', () => {
    expect(JOBS.map(j => j.id)).toEqual(['pecode', 'hys']);
  });

  it('describes the EF SET certificate', () => {
    expect(CERTIFICATES[0]).toMatchObject({
      level: 'C2',
      score: 74,
      max: 100,
      url: 'https://cert.efset.org/en/oWhPgz',
    });
    expect(CERTIFICATES[0].parts.map(p => p.value)).toEqual([72, 76]);
  });

  it('lists the contact profiles, including WhatsApp and both GitHub accounts', () => {
    expect(SOCIALS.map(s => [s.id, s.handle, s.href])).toEqual([
      ['telegram', '@oleksandrbryksin', 'https://t.me/oleksandrbryksin'],
      ['whatsapp', '@oleksandrbryksin', 'https://wa.me/380635383049'],
      ['linkedin', 'oleksandr-bryksin', 'https://www.linkedin.com/in/oleksandr-bryksin-898687253/'],
      ['github', 'edgergard', 'https://github.com/edgergard'],
      ['github-alt', 'edgelordxd', 'https://github.com/edgelordxd?tab=repositories'],
    ]);
  });

  it('has the four facts', () => {
    expect(FACTS.map(f => f.value)).toEqual(['2.5+', '5', '12', 'C1']);
  });

  it('titles the HYS role React Native / Frontend Developer in EN and UA', () => {
    expect(en.job_hys_role).toBe('React Native / Frontend Developer');
    expect(ua.job_hys_role).toBe('React Native / Frontend-розробник');
  });

  it('lists the three education entries from the CV', () => {
    expect(EDUCATION.map(e => [e.id, e.kind])).toEqual([
      ['nuft', 'university'],
      ['kpi', 'university'],
      ['mate', 'course'],
    ]);
  });

  it('drops the education status field and its translation keys', () => {
    for (const edu of EDUCATION) {
      expect(edu).not.toHaveProperty('status');
    }

    for (const dict of [en, ua]) {
      expect(Object.keys(dict).filter(k => k.startsWith('edu_status_'))).toEqual([]);
    }
  });

  it('has the same translation keys in EN and UA', () => {
    expect(Object.keys(ua).sort()).toEqual(Object.keys(en).sort());
  });

  it('references only translation keys that exist', () => {
    const keys = [
      ...FACTS.flatMap(f => [f.labelKey, f.unitKey]),
      ...SKILLS.map(s => s.titleKey),
      ...JOBS.flatMap(j => [
        j.roleKey,
        j.periodKey,
        j.companyLineKey,
        j.durationKey,
        ...j.bulletKeys,
        ...j.metrics.flatMap(m => [m.valueKey, m.labelKey]),
      ]),
      ...EDUCATION.flatMap(e => [e.institutionKey, e.programmeKey, e.periodKey, `edu_kind_${e.kind}`]),
      ...CERTIFICATES.flatMap(c => [
        c.levelNameKey,
        c.awardedKey,
        ...c.parts.map(p => p.labelKey),
      ]),
    ];
    const missing = keys.filter(k => !(k in en));

    expect(missing).toEqual([]);
  });

  it('publishes the phone number (the owner asked for it) as a tel: link', () => {
    expect(PHONE).toEqual({
      display: '+380 63 538 3049',
      e164: '+380635383049',
      href: 'tel:+380635383049',
    });
  });

  it('opens WhatsApp on the same number', () => {
    const whatsapp = SOCIALS.find(s => s.id === 'whatsapp')!;

    expect(whatsapp.href).toBe(`https://wa.me/${PHONE.e164.slice(1)}`);
  });
});
