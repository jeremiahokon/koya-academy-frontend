import axios from 'axios';

// Calls this app's own /api proxy, which adds the API key on the server.
export const apiClient = axios.create({ baseURL: '/api' });

// The API answers errors as { error: "..." }.
export const getErrorMessage = (error: unknown) =>
  (axios.isAxiosError(error) && error.response?.data?.error) ||
  'Something went wrong';
