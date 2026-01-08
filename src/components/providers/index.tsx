'use client';

import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NextTopLoader from 'nextjs-toploader';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: false, // No retries - only 1 call
    },
    mutations: {
      retry: false, // No retries - only 1 call
    },
  },
});

const Providers = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <Toaster />
      <NextTopLoader height={6} color="#005695" />
      {children}
    </SessionProvider>
  </QueryClientProvider>
);

export default Providers;
