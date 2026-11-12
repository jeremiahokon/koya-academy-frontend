import axios from 'axios';

// Server-only axios instance for the Railway API. Imported only by the /api proxy
// route, so KOYA_API_KEY (no NEXT_PUBLIC_ prefix) never reaches the browser bundle.
export const koyaServer = axios.create({
  baseURL: process.env.KOYA_API_URL?.replace(/\/+$/, ''),
  headers: { 'X-API-Key': process.env.KOYA_API_KEY ?? '' },
  timeout: 15_000,
  // Pass every status through: the proxy relays the API's own status and error body.
  validateStatus: () => true,
});
