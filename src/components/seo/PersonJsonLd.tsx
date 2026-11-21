import { SOCIALS } from '@/data/content';
import { SITE_NAME } from '@/lib/metadata';
import { SITE_URL } from '@/lib/site';

const profile = (id: 'github' | 'linkedin') => SOCIALS.find(s => s.id === id)?.href;

const PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  'name': SITE_NAME,
  'jobTitle': 'React Native & Frontend Developer',
  'url': SITE_URL,
  'address': { '@type': 'PostalAddress', 'addressLocality': 'Kyiv', 'addressCountry': 'UA' },
  'sameAs': [profile('github'), profile('linkedin')].filter(Boolean),
};

/** schema.org Person for the home page; `<` is escaped so the JSON cannot close the script. */
const PersonJsonLd = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON).replace(/</g, '\u003c') }}
  />
);

export default PersonJsonLd;
