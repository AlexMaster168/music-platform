'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Topbar() {
   const router = useRouter();
   const dispatch = useAppDispatch();
   const { isAuthed, user } = useAuth();
   const [q, setQ] = useState('');

   const submit = (e: React.FormEvent) => {
      e.preventDefault();
      if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
   };

   return (
      <header className="flex items-center gap-4 border-b border-[var(--color-line)] px-4 py-3 md:px-6">
         <Link href="/" className="text-base font-bold md:hidden">
            <span className="text-[var(--color-brand)]">▶</span> Музыка
         </Link>

         <form onSubmit={submit} className="relative flex-1 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
            <Input
               value={q}
               onChange={(e) => setQ(e.target.value)}
               placeholder="Поиск треков, артистов, альбомов"
               className="pl-10"
            />
         </form>

         <div className="ml-auto flex items-center gap-3">
            {isAuthed ? (
               <>
                  <div className="hidden items-center gap-2 sm:flex">
                     <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand)] text-sm font-bold text-white">
                        {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
                     </span>
                     <span className="text-sm">{user?.displayName}</span>
                  </div>
                  <Button
                     variant="ghost"
                     size="icon"
                     onClick={() => dispatch(logout())}
                     aria-label="Выйти"
                  >
                     <LogOut className="h-4 w-4" />
                  </Button>
               </>
            ) : (
               <Link href="/login">
                  <Button variant="primary" size="sm">
                     Войти
                  </Button>
               </Link>
            )}
         </div>
      </header>
   );
}
