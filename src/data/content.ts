export type Fact = { labelKey: string; value: string; unitKey: string };
export type SkillGroup = { titleKey: string; items: string[] };
export type JobMetric = { valueKey: string; labelKey: string };
/** A job on the home Experience section (the web CV keeps its own data, mirroring the PDF). */
export type Job = {
  id: 'pecode' | 'hys';
  company: string;
  /** Company line under the role, e.g. "Pecode · Outsourcing · Kyiv". */
  companyLineKey: string;
  roleKey: string;
  periodKey: string;
  durationKey: string;
  metrics: JobMetric[];
  bulletKeys: string[];
  stack: string[];
};
export type Education = {
  id: 'nuft' | 'kpi' | 'mate';
  kind: 'university' | 'course';
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

/** Commercial projects worked on: 9 at Pecode (7 mobile, 2 web) + 3 products at HYS (see the job metrics). */
export const PROJECT_COUNT = '12';

export const FACTS: Fact[] = [
  { labelKey: 'fact_experience_label', value: '2.5+', unitKey: 'fact_experience_unit' },
  { labelKey: 'fact_apps_label', value: '5', unitKey: 'fact_apps_unit' },
  { labelKey: 'fact_projects_label', value: PROJECT_COUNT, unitKey: 'fact_projects_unit' },
  { labelKey: 'fact_english_label', value: 'C1', unitKey: 'fact_english_unit' },
];

/** Home page skills: everything on either CV, grouped for the portfolio (the CVs keep their own lists). */
export const SKILLS: SkillGroup[] = [
  {
    titleKey: 'skills_web',
    items: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Vue', 'HTML5', 'CSS3', 'Tailwind CSS', 'SCSS', 'shadcn/ui'],
  },
  {
    titleKey: 'skills_mobile',
    items: [
      'React Native', 'React Native CLI', 'Expo', 'Expo Router', 'React Navigation', 'Reanimated', 'NativeWind',
      'BLE', 'NFC', 'Mesh', 'Mapbox', 'Offline maps', 'Background geo & audio', 'Push notifications',
      'Deep linking', 'AsyncStorage',
    ],
  },
  {
    titleKey: 'skills_data',
    items: [
      'Redux Toolkit', 'Zustand', 'Pinia', 'TanStack Query', 'React Hook Form', 'VeeValidate', 'Supabase',
      'Firebase', 'RevenueCat', 'Stripe API', 'REST',
    ],
  },
  {
    titleKey: 'skills_quality',
    items: ['Responsive design', 'Accessibility', 'Technical SEO', 'Lighthouse', 'Image optimization', 'i18n / RTL'],
  },
  {
    titleKey: 'skills_testing',
    items: ['Jest', 'React Testing Library', 'Playwright'],
  },
  {
    titleKey: 'skills_ship',
    items: [
      'EAS', 'GitHub Actions', 'App Store Connect', 'TestFlight', 'Play Console', 'Xcode', 'Android Studio',
      'Vercel', 'Git', 'PostHog', 'Three.js', 'OpenAI API', 'Claude Code & Codex',
    ],
  },
];

const metrics = (job: Job['id']) =>
  [1, 2, 3].map(n => ({ valueKey: `job_${job}_m${n}_value`, labelKey: `job_${job}_m${n}_label` }));

export const JOBS: Job[] = [
  {
    id: 'pecode',
    company: 'Pecode',
    companyLineKey: 'job_pecode_company_line',
    roleKey: 'job_pecode_role',
    periodKey: 'job_pecode_period',
    durationKey: 'job_pecode_duration',
    metrics: metrics('pecode'),
    bulletKeys: [1, 2, 3, 4, 5].map(n => `job_pecode_b${n}`),
    stack: ['React Native', 'Expo', 'TypeScript', 'BLE', 'NFC', 'Mapbox', 'Next.js', 'Supabase', 'RevenueCat', 'EAS'],
  },
  {
    id: 'hys',
    company: 'HYS Enterprise',
    companyLineKey: 'job_hys_company_line',
    roleKey: 'job_hys_role',
    periodKey: 'job_hys_period',
    durationKey: 'job_hys_duration',
    metrics: metrics('hys'),
    bulletKeys: [1, 2, 3, 4, 5].map(n => `job_hys_b${n}`),
    stack: ['React Native', 'Next.js', 'TanStack Query', 'Vue', 'Pinia', 'PostHog'],
  },
];

export const EDUCATION: Education[] = [
  {
    id: 'nuft',
    kind: 'university',
    institutionKey: 'edu_nuft_institution',
    programmeKey: 'edu_nuft_programme',
    periodKey: 'edu_nuft_period',
  },
  {
    id: 'kpi',
    kind: 'university',
    institutionKey: 'edu_kpi_institution',
    programmeKey: 'edu_kpi_programme',
    periodKey: 'edu_kpi_period',
  },
  {
    id: 'mate',
    kind: 'course',
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

/** Published at the owner's request; WhatsApp is registered on the same number. */
export const PHONE = {
  display: '+380 63 538 3049',
  e164: '+380635383049',
  href: 'tel:+380635383049',
} as const;

export type Social = {
  id: 'telegram' | 'whatsapp' | 'linkedin' | 'github' | 'github-alt';
  label: string;
  handle: string;
  /** Profile URL, opened in a new tab (WhatsApp's opens a chat on PHONE). */
  href: string;
};

export const SOCIALS: Social[] = [
  { id: 'telegram', label: 'Telegram', handle: '@oleksandrbryksin', href: 'https://t.me/oleksandrbryksin' },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    handle: '@oleksandrbryksin',
    href: `https://wa.me/${PHONE.e164.slice(1)}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'oleksandr-bryksin',
    href: 'https://www.linkedin.com/in/oleksandr-bryksin-898687253/',
  },
  { id: 'github', label: 'GitHub', handle: 'edgergard', href: 'https://github.com/edgergard' },
  {
    id: 'github-alt',
    label: 'GitHub',
    handle: 'edgelordxd',
    href: 'https://github.com/edgelordxd?tab=repositories',
  },
];

export const TELEGRAM_URL = 'https://t.me/oleksandrbryksin';
