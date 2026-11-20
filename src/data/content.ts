export type Fact = { labelKey: string; value: string; unitKey: string };
export type SkillGroup = { titleKey: string; items: string[] };
export type Job = {
  id: 'pecode' | 'hys' | 'self';
  company: string;
  companyKey?: string;
  roleKey: string;
  periodKey: string;
  bulletKeys: string[];
  stack: string[];
};
export type Education = {
  id: 'nuft' | 'kpi' | 'mate';
  kind: 'university' | 'course';
  status: 'progress' | 'completed' | 'certificate';
  institutionKey: string;
  programmeKey: string;
  periodKey: string;
};
export type Certificate = {
  id: 'efset';
  issuer: string;
  level: 'C2';
  levelNameKey: string;
  score: number;
  max: number;
  parts: { labelKey: string; value: number }[];
  awardedKey: string;
  url: string;
};

export const FACTS: Fact[] = [
  { labelKey: 'fact_experience_label', value: '2.5+', unitKey: 'fact_experience_unit' },
  { labelKey: 'fact_apps_label', value: '5', unitKey: 'fact_apps_unit' },
  { labelKey: 'fact_performance_label', value: '95–100', unitKey: 'fact_performance_unit' },
  { labelKey: 'fact_english_label', value: 'C1', unitKey: 'fact_english_unit' },
];

export const SKILLS: SkillGroup[] = [
  {
    titleKey: 'skills_web',
    items: ['TypeScript', 'React', 'Next.js', 'Vue', 'Pinia', 'Tailwind CSS', 'shadcn/ui'],
  },
  {
    titleKey: 'skills_mobile',
    items: ['React Native', 'Expo', 'BLE', 'NFC', 'Mesh', 'Mapbox', 'Offline maps', 'Background geo & audio'],
  },
  {
    titleKey: 'skills_data',
    items: ['Redux Toolkit', 'Zustand', 'TanStack Query', 'Supabase', 'Firebase', 'RevenueCat', 'REST'],
  },
  {
    titleKey: 'skills_ship',
    items: ['EAS', 'GitHub Actions', 'TestFlight', 'Play Console', 'PostHog', 'Lighthouse', 'Three.js', 'OpenAI API'],
  },
];

export const JOBS: Job[] = [
  {
    id: 'pecode',
    company: 'Pecode',
    roleKey: 'job_pecode_role',
    periodKey: 'job_pecode_period',
    bulletKeys: [1, 2, 3, 4, 5].map(n => `job_pecode_b${n}`),
    stack: ['React Native', 'Expo', 'TypeScript', 'BLE', 'NFC', 'Mapbox', 'Next.js', 'Supabase', 'RevenueCat', 'EAS'],
  },
  {
    id: 'hys',
    company: 'HYS Enterprise',
    roleKey: 'job_hys_role',
    periodKey: 'job_hys_period',
    bulletKeys: [1, 2, 3, 4].map(n => `job_hys_b${n}`),
    stack: ['React Native', 'Next.js', 'TanStack Query', 'Vue', 'Pinia', 'PostHog'],
  },
  {
    id: 'self',
    company: 'Self-employed',
    companyKey: 'job_self_company',
    roleKey: 'job_self_role',
    periodKey: 'job_self_period',
    bulletKeys: ['job_self_b1'],
    stack: ['React', 'JavaScript', 'TypeScript', 'Bulma', 'Git'],
  },
];

export const EDUCATION: Education[] = [
  {
    id: 'nuft',
    kind: 'university',
    status: 'progress',
    institutionKey: 'edu_nuft_institution',
    programmeKey: 'edu_nuft_programme',
    periodKey: 'edu_nuft_period',
  },
  {
    id: 'kpi',
    kind: 'university',
    status: 'completed',
    institutionKey: 'edu_kpi_institution',
    programmeKey: 'edu_kpi_programme',
    periodKey: 'edu_kpi_period',
  },
  {
    id: 'mate',
    kind: 'course',
    status: 'certificate',
    institutionKey: 'edu_mate_institution',
    programmeKey: 'edu_mate_programme',
    periodKey: 'edu_mate_period',
  },
];

export const CERTIFICATES: Certificate[] = [
  {
    id: 'efset',
    issuer: 'EF SET',
    level: 'C2',
    levelNameKey: 'cert_level_name',
    score: 74,
    max: 100,
    parts: [
      { labelKey: 'cert_reading', value: 72 },
      { labelKey: 'cert_listening', value: 76 },
    ],
    awardedKey: 'cert_awarded',
    url: 'https://cert.efset.org/en/oWhPgz',
  },
];

export const EMAIL = 'oleksandrbryksin@gmail.com';

export const SOCIALS: { id: 'linkedin' | 'github' | 'telegram'; label: string; href: string }[] = [
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/oleksandr-bryksin-898687253/' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/edgergard' },
  { id: 'telegram', label: 'Telegram', href: 'https://t.me/oleksandrbryksin' },
];
