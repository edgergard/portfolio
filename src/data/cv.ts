export type CvVariant = 'react-native' | 'frontend';

export type CvDoc = {
  variant: CvVariant;
  title: string;
  pdf: string;
  summary: string;
  contacts: { label: string; href: string }[];
  experience: { company: string; role: string; period: string; bullets: string[] }[];
  skills: { group: string; items: string[] }[];
  education: { title: string; period: string }[];
  languages: string[];
};

// The phone number printed in the PDFs is intentionally omitted from the web CV.
const CONTACTS: CvDoc['contacts'] = [
  { label: 'oleksandrbryksin@gmail.com', href: 'mailto:oleksandrbryksin@gmail.com' },
  { label: 'Telegram @oleksandrbryksin', href: 'https://t.me/oleksandrbryksin' },
  {
    label: 'linkedin.com/in/oleksandr-bryksin-898687253',
    href: 'https://www.linkedin.com/in/oleksandr-bryksin-898687253/',
  },
  { label: 'github.com/edgergard', href: 'https://github.com/edgergard' },
];

const EDUCATION: CvDoc['education'] = [
  { title: 'National University of Food Technologies, B.Sc. in Software Engineering (in progress)', period: '2026 – present' },
  { title: 'Mate Academy, Fullstack Development course (certificate)', period: '2023' },
  { title: 'Igor Sikorsky Kyiv Polytechnic Institute, Automation and Computer-Integrated Technologies', period: '2019 – 2022' },
];

const LANGUAGES = ['Ukrainian: native', 'English: C1 (Advanced)'];

export const CVS: Record<CvVariant, CvDoc> = {
  'react-native': {
    variant: 'react-native',
    title: 'React Native Developer',
    pdf: 'oleksandr-bryksin-react-native-cv.pdf',
    summary:
      'React Native developer with 2.5+ years in web and mobile development. I used Claude Code to set up testing in CI and worked with AI tools to debug API requests in a Bluetooth messaging app. I integrated an image-analysis API into two camera apps and built a hands-free guide that uses OpenAI text-to-speech to narrate landmarks as users walk past. I automated iOS and Android builds and uploads with GitHub Actions and EAS.',
    contacts: CONTACTS,
    experience: [
      {
        company: 'Pecode',
        role: 'React Native / Frontend Developer',
        period: 'Oct 2025 - Oct 2026',
        bullets: [
          'Outsourcing; 7 mobile and 2 web projects under NDA, all using TypeScript',
          'Released 3 apps on the App Store and Google Play and submitted updated builds of 2 other apps for review.',
          'Prepared 10+ pre-sale project estimates; communicated directly with clients, reviewed code and helped onboard developers.',
          'Patched third-party dependencies to resolve bugs blocking development.',
          'Off-grid mesh messenger | Expo, react-native-ble-plx, Firebase, Mapbox',
          'Built the mobile app from scratch, connecting phones to MeshCore devices over BLE for direct and group messaging and friend location tracking on offline Mapbox maps.',
          'Synced stored messages on BLE reconnect. In tests with two MeshCore devices, sync typically took 2 seconds or less.',
          'Integrated Firebase authentication (Apple / Google sign-in) and push notifications with the backend developer.',
          "Collaborated with a US-based backend developer and handled the app's transfer between Apple Developer accounts.",
          'AI-powered audio guide | Expo, Firebase, OpenAI API, NFC',
          'Built and released the app as the sole developer, including Firebase setup and integration.',
          'Triggered OpenAI audio narration near landmarks with the phone locked. Tested background playback on walks of up to 1 hour and routes with up to 15 waypoints.',
          'Added NFC tag reading and audio playback triggered by tapping a tag for indoor use.',
          'Automated builds and uploads to App Store Connect and Google Play Console after PR merges with GitHub Actions, EAS Build and EAS Submit. Cut hands-on time per iOS and Android build pair from about 1 hour to 5 minutes or less.',
          'Two AI image-analysis apps | React Native CLI, RevenueCat',
          'Built one app from scratch and extended the other as the sole mobile developer. Distributed builds via TestFlight and submitted more than 10 updates for App Review across both apps.',
          'Integrated an ML image-analysis API, authentication, scan history and RevenueCat subscriptions.',
          'Pecode - additional projects',
          'AI workout app: implemented weekly, monthly and annual RevenueCat plans, a discounted annual offer and a free trial. Fixed bugs and submitted both mobile builds in 3 days from handoff.',
          'Marketplace: audited an existing app for Mexico, moved hardcoded configuration into environment variables, upgraded React Native and dependencies, refactored duplicated code and configured ESLint.',
          'Billiards tournaments (Expo, Replit): refactored the inherited code and fixed calculation and state bugs that charged players more than the agreed 5% commission. Added Apple and Google sign-in and push notifications.',
          'Home services (Expo, Zustand): built about 5 Arabic RTL screens and integrated REST APIs in a six-person team.',
          'Web: built a Next.js lead-generation site that scored 95-100 in Lighthouse in all four categories across the entire site (about 20 pages) on desktop and mobile. Also developed document management features with Next.js and Supabase.',
        ],
      },
      {
        company: 'HYS Enterprise',
        role: 'Frontend Developer',
        period: 'Apr 2024 - Oct 2025',
        bullets: [
          'Teams of 6-9; direct communication with international clients in English',
          'Built screens and real-time updates for an mHealth MVP with React Native, Redux Toolkit and NativeWind. The team had a working demo 3 months after I joined.',
          'Built a Next.js admin portal with CRUD and TanStack Query caching to reuse fetched data and reduce repeated loading states.',
          'Implemented Vue / Pinia B2B interfaces, REST integrations, multilingual support and VeeValidate form validation.',
          'Migrated 70% of the site from Vue to React in 2 months, one month ahead of the original 3-month estimate. Integrated PostHog for diagnosing production issues.',
        ],
      },
    ],
    skills: [
      { group: 'Core', items: ['TypeScript', 'JavaScript', 'React Native CLI', 'Expo', 'React Navigation', 'Expo Router'] },
      {
        group: 'Mobile',
        items: ['BLE', 'NFC', 'Mapbox', 'background geolocation', 'Reanimated', 'AsyncStorage', 'deep linking', 'push notifications', 'i18n / RTL', 'NativeWind'],
      },
      {
        group: 'Data',
        items: ['Firebase Auth / Cloud Messaging', 'Zustand', 'Redux Toolkit', 'TanStack Query', 'React Hook Form', 'REST APIs'],
      },
      {
        group: 'Delivery & tools',
        items: [
          'GitHub Actions',
          'EAS Build / Submit',
          'App Store Connect',
          'TestFlight',
          'Google Play Console',
          'Xcode',
          'Android Studio',
          'Git',
          'Claude Code and ChatGPT Codex (AI-assisted development)',
        ],
      },
      {
        group: 'Web',
        items: ['React', 'Next.js', 'Vue', 'Tailwind CSS', 'Supabase', 'basic test setup: Jest, React Testing Library, Playwright'],
      },
    ],
    education: EDUCATION,
    languages: LANGUAGES,
  },
  frontend: {
    variant: 'frontend',
    title: 'Frontend Developer (React / Next.js)',
    pdf: 'oleksandr-bryksin-frontend-cv.pdf',
    summary:
      'Frontend developer with 2.5+ years building TypeScript applications with React, Next.js and Vue. On a Next.js platform backed by Supabase, I used Claude Code to extend how users store and manage documents and to work through security fixes in the existing codebase. I also reviewed an AI-generated Base44 project to estimate the work it would take to develop it further. My web work includes a Vue-to-React migration and a site that scored 95-100 in Lighthouse on desktop and mobile.',
    contacts: CONTACTS,
    experience: [
      {
        company: 'Pecode',
        role: 'Frontend / React Native Developer',
        period: 'Oct 2025 - Oct 2026',
        bullets: [
          'Outsourcing; 2 web and 7 mobile projects under NDA, all using TypeScript',
          'Prepared 10+ pre-sale estimates, including analysis of an exported Base44 codebase.',
          'Communicated directly with clients, reviewed code and helped onboard developers.',
          'Lead-generation website for a US metallurgical company | Next.js, Tailwind CSS, Stripe API, Vercel',
          "Built and deployed the site as the sole developer, working with a designer to replace the client's outdated website.",
          'Implemented metadata, Open Graph, sitemap, robots.txt, JSON-LD and SSR / SSG; optimized images, performance and accessibility.',
          'Scored 95-100 in all four Lighthouse categories on desktop and mobile across the entire site (about 20 pages).',
          'Integrated a Stripe API-backed content workflow so the client could update website copy and images independently.',
          'Built a quote request form and a price calculator for lead capture.',
          'Document management platform | Next.js, Supabase',
          'Implemented document storage and management features, integrated Supabase database queries and addressed security issues in an existing platform.',
          'Additional mobile delivery & automation',
          'Released 3 React Native apps on the App Store and Google Play and submitted updated builds of 2 other apps for review.',
          'Automated iOS and Android builds and uploads for an audio guide using GitHub Actions, EAS Build and EAS Submit. Cut hands-on time per build pair from about 1 hour to 5 minutes or less.',
        ],
      },
      {
        company: 'HYS Enterprise',
        role: 'Frontend Developer',
        period: 'Apr 2024 - Oct 2025',
        bullets: [
          'Teams of 6-9; direct communication with international clients in English',
          'Admin portal | Next.js, Tailwind CSS, Zustand, TanStack Query',
          'Built CRUD interfaces for user data management and integrated API-driven data flows.',
          'Added TanStack Query caching to reuse fetched data and reduce repeated loading states.',
          'B2B portal | Vue, Pinia, Tailwind CSS, VeeValidate',
          'Implemented frontend interfaces and REST API integrations in collaboration with the backend team.',
          'Added i18n support for about 10 European languages. Implemented live validation with VeeValidate on every screen of the largest form (about 8 screens).',
          'Vue-to-React migration | React, Vite, Redux Toolkit, React Hook Form',
          'Migrated 70% of the site from Vue to React in 2 months, one month ahead of the original 3-month estimate. Integrated PostHog to investigate production issues.',
          'mHealth MVP | React Native, Redux Toolkit, Redux Persist, NativeWind',
          'Built mobile interfaces and real-time updates for the MVP. The team had a working demo 3 months after I joined.',
        ],
      },
    ],
    skills: [
      { group: 'Core', items: ['TypeScript', 'JavaScript', 'React', 'Next.js (SSR / SSG)', 'Vue', 'HTML5', 'CSS3'] },
      {
        group: 'UI & data',
        items: ['Tailwind CSS', 'SCSS', 'shadcn/ui', 'Redux Toolkit', 'Zustand', 'Pinia', 'TanStack Query', 'React Hook Form', 'VeeValidate', 'REST APIs', 'i18n'],
      },
      {
        group: 'Web quality',
        items: ['responsive design', 'accessibility', 'technical SEO', 'Lighthouse', 'image optimization'],
      },
      {
        group: 'Services & delivery',
        items: [
          'Supabase',
          'Firebase',
          'Stripe API',
          'Vercel',
          'GitHub Actions',
          'Git',
          'Claude Code and ChatGPT Codex (AI-assisted development)',
          'additional mobile experience with React Native and Expo',
        ],
      },
      { group: 'Basic test setup', items: ['Jest', 'React Testing Library', 'Playwright'] },
    ],
    education: EDUCATION,
    languages: LANGUAGES,
  },
};
