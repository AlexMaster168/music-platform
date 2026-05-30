'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { store } from '@/store';
import { loadMe } from '@/store/authSlice';
import { AudioEngine } from '@/components/player/AudioEngine';

export function Providers({ children }: { children: ReactNode }) {
   // QueryClient создаём один раз на жизнь компонента (паттерн TanStack Query)
   const [queryClient] = useState(
      () =>
         new QueryClient({
            defaultOptions: {
               queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
            },
         }),
   );

   useEffect(() => {
      void store.dispatch(loadMe());
   }, []);

   return (
      <Provider store={store}>
         <QueryClientProvider client={queryClient}>
            {children}
            <AudioEngine />
            <Toaster theme="dark" position="top-center" richColors />
         </QueryClientProvider>
      </Provider>
   );
}
