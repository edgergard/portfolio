import { describe, expect, it } from 'vitest';
import en from '../translations/en.json';
import ua from '../translations/ua.json';
import {
  CERTIFICATES,
  EDUCATION,
  FACTS,
  JOBS,
  SKILLS,
  SOCIALS,
} from './content';

const sources = import.meta.glob('/src/**/*.{ts,tsx,json}', {
  query: '?raw',
  eager: true,
}) as Record<string, { default: string } | string>;

describe('content data', () => {
  it('lists the jobs in order', () => {
    expect(JOBS.map(j => j.id)).toEqual(['pecode', 'hys', 'self']);
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
      ['whatsapp', '@oleksandrbryksin', undefined],
      ['linkedin', 'oleksandr-bryksin', 'https://www.linkedin.com/in/oleksandr-bryksin-898687253/'],
      ['github', 'edgergard', 'https://github.com/edgergard'],
      ['github-alt', 'edgelordxd', 'https://github.com/edgelordxd?tab=repositories'],
    ]);
  });

  it('has the four facts', () => {
    expect(FACTS.map(f => f.value)).toEqual(['2.5+', '5', '95–100', 'C1']);
  });

  it('titles the HYS role React Native / Frontend Developer in EN and UA', () => {
    expect(en.job_hys_role).toBe('React Native / Frontend Developer');
    expect(ua.job_hys_role).toBe('React Native / Frontend-розробник');
  });

  it('lists the three education entries from the CV', () => {
    expect(EDUCATION.map(e => [e.id, e.kind, e.status])).toEqual([
      ['nuft', 'university', 'progress'],
      ['kpi', 'university', 'completed'],
      ['mate', 'course', 'certificate'],
    ]);
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
        ...(j.companyKey ? [j.companyKey] : []),
        ...j.bulletKeys,
      ]),
      ...EDUCATION.flatMap(e => [e.institutionKey, e.programmeKey, e.periodKey, `edu_kind_${e.kind}`, `edu_status_${e.status}`]),
      ...CERTIFICATES.flatMap(c => [
        c.levelNameKey,
        c.awardedKey,
        ...c.parts.map(p => p.labelKey),
      ]),
    ];
    const missing = keys.filter(k => !(k in en));

    expect(missing).toEqual([]);
  });

  it('does not contain the phone number anywhere in src', () => {
    const phone = ['38063', '5383049'].join('');
    const offenders = Object.entries(sources)
      .filter(([, mod]) =>
        (typeof mod === 'string' ? mod : mod.default).includes(phone),
      )
      .map(([path]) => path);

    expect(offenders).toEqual([]);
  });
});
