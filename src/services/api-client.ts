import axios, { type AxiosError } from 'axios';

// Browser axios client. It talks to this app's own /api proxy, never to Railway
// directly, so no API key is needed (or exposed) here.
export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000,
});

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter?: number
  ) {
    super(message);
  }
}

// Every failure becomes an ApiError carrying the API's own { error } message.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) =>
    Promise.reject(
      new ApiError(
        error.response?.data?.error ?? 'the booking service is unreachable',
        error.response?.status ?? 0,
        Number(error.response?.headers['retry-after']) || undefined
      )
    )
);

export const errorMessage = (error: unknown) => {
  if (!(error instanceof ApiError)) return 'Something went wrong.';

  if (error.status === 429) {
    return error.retryAfter
      ? `Too many booking attempts for this email. Try again in ${error.retryAfter} second${error.retryAfter === 1 ? '' : 's'}.`
      : 'Too many booking attempts for this email. Try again in a minute.';
  }

  return `${error.message.charAt(0).toUpperCase()}${error.message.slice(1)}.`;
};

// Query and mutation errors are typed as ApiError everywhere.
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}
