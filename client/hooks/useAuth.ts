'use client';

import { useAppSelector } from '@/store/hooks';

export const useAuth = () => {
   const user = useAppSelector((s) => s.auth.user);
   const status = useAppSelector((s) => s.auth.status);
   return {
      user,
      isAuthed: !!user,
      ready: status === 'authenticated' || status === 'guest',
   };
};
