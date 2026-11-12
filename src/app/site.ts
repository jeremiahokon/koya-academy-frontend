// The one canonical origin, shared by metadata, JSON-LD, sitemap, robots and llms.txt.
// Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every deployment, so previews still
// point search engines at the production host.
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = host ? `https://${host}` : 'http://localhost:3000';
