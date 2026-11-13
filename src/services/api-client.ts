import axios from 'axios';

// Calls this app's own /api proxy, which adds the API key on the server.
export const apiClient = axios.create({ baseURL: '/api' });

// The API answers errors as { error: "..." }. A 429 also sends Retry-After in seconds.
export const getErrorMessage = (error: unknown) => {
  if (!axios.isAxiosError(error)) return 'Something went wrong';

  const retryAfter = error.response?.headers['retry-after'];

  if (error.response?.status === 429 && retryAfter) {
    return `Too many booking attempts. Try again in ${retryAfter} seconds.`;
  }

  return error.response?.data?.error || 'Something went wrong';
};

// The HTTP status the API answered with, or undefined when no answer arrived
// (network drop, timeout).
export const getStatus = (error: unknown) =>
  axios.isAxiosError(error) ? error.response?.status : undefined;
