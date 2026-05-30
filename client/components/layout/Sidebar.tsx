'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
   Home,
   Library,
   ListMusic,
   Search,
   Upload,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMyPlaylists } from '@/hooks/queries';
import { cn } from '@/lib/utils';

const NAV = [
   { href: '/', label: 'Главная', icon: Home },
   { href: '/search', label: 'Поиск', icon: Search },
   { href: '/library', label: 'Библиотека', icon: Library },
   { href: '/upload', label: 'Загрузить', icon: Upload },
];

export function Sidebar() {
   const pathname = usePathname();
   const { isAuthed } = useAuth();
   const { data: playlists } = useMyPlaylists(isAuthed);

   return (
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--color-line)] bg-[var(--color-base)] md:flex">
         <div className="px-6 py-5">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
               <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-brand)] text-white">
                  ▶
               </span>
               Музыка
            </Link>
         </div>

         <nav className="flex flex-col gap-1 px-3">
            {NAV.map(({ href, label, icon: Icon }) => {
               const active = pathname === href;
               return (
                  <Link
                     key={href}
                     href={href}
                     className={cn(
                        'flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                           ? 'bg-[var(--color-surface)] text-white'
                           : 'text-[var(--color-muted)] hover:bg-white/5 hover:text-white',
                     )}
                  >
                     <Icon className="h-5 w-5" />
                     {label}
                  </Link>
               );
            })}
         </nav>

         {isAuthed && playlists && playlists.length > 0 && (
            <div className="mt-4 flex-1 overflow-y-auto border-t border-[var(--color-line)] px-3 py-3">
               <div className="px-3 pb-2 text-xs font-semibold uppercase text-[var(--color-muted)]">
                  Плейлисты
               </div>
               {playlists.map((pl) => (
                  <Link
                     key={pl._id}
                     href={`/playlist/${pl._id}`}
                     className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        pathname === `/playlist/${pl._id}`
                           ? 'bg-[var(--color-surface)] text-white'
                           : 'text-[var(--color-muted)] hover:bg-white/5 hover:text-white',
                     )}
                  >
                     <ListMusic className="h-4 w-4 shrink-0" />
                     <span className="truncate">{pl.title}</span>
                  </Link>
               ))}
            </div>
         )}
      </aside>
   );
}
