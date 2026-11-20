import { describe, expect, it } from 'vitest';
import en from '../translations/en.json';
import ua from '../translations/ua.json';
import {
  CERTIFICATES,
  EDUCATION,
  FACTS,
  JOBS,
  SKILLS,
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

  it('has the four facts', () => {
    expect(FACTS.map(f => f.value)).toEqual(['2.5+', '5', '95–100', 'C1']);
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
      ...EDUCATION.flatMap(e => [e.metaKey, e.titleKey]),
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
