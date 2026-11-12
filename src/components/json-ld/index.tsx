import { siteUrl } from '@/app/site';

import { clinic, faqs } from '@/data/clinic';

// No address, phone or hours: the clinic is the assessment's demo, and none are invented.
const graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: clinic.name,
      description: clinic.description,
      publisher: { '@id': `${siteUrl}/#clinic` },
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: siteUrl,
      name: `${clinic.name}: ${clinic.tagline}`,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#clinic` },
      mainEntity: { '@id': `${siteUrl}/#faq` },
    },
    {
      '@type': 'MedicalClinic',
      '@id': `${siteUrl}/#clinic`,
      name: clinic.name,
      url: siteUrl,
      logo: `${siteUrl}/logo-512.png`,
      description: clinic.description,
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  ],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, '\\u003c'),
      }}
    />
  );
}
