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

/**
 * JSON for a <script type="application/ld+json">. Every `<` becomes the JSON escape < (the
 * six characters, hence '\\u003c'), so the payload cannot close the tag and still parses the same.
 */
export const toJsonLd = (value: unknown): string => JSON.stringify(value).replace(/</g, '\\u003c');

/** schema.org Person for the home page. */
const PersonJsonLd = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: toJsonLd(PERSON) }}
  />
);

export default PersonJsonLd;
