'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ListMusic, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
   useCreatePlaylist,
   useLibrary,
   useMyPlaylists,
} from '@/hooks/queries';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cover } from '@/components/common/Cover';
import { MediaCard } from '@/components/media/MediaCard';
import { TrackList } from '@/components/track/TrackList';

export default function LibraryPage() {
   const { isAuthed } = useAuth();
   const { data: library } = useLibrary(isAuthed);
   const { data: playlists } = useMyPlaylists(isAuthed);
   const create = useCreatePlaylist();
   const [title, setTitle] = useState('');

   if (!isAuthed) {
      return (
         <div className="flex flex-col items-center justify-center py-24 text-center">
            <h1 className="text-2xl font-bold">Библиотека</h1>
            <p className="mt-2 text-[var(--color-muted)]">
               Войди, чтобы видеть лайки, плейлисты и подписки.
            </p>
            <Link
               href="/login"
               className="mt-4 rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-medium"
            >
               Войти
            </Link>
         </div>
      );
   }

   const onCreate = async () => {
      if (!title.trim()) return;
      await create.mutateAsync({ title: title.trim() });
      setTitle('');
      toast.success('Плейлист создан');
   };

   return (
      <div>
         <h1 className="mb-6 text-2xl font-bold">Моя библиотека</h1>

         <section className="mb-8">
            <div className="mb-3 flex items-center justify-between gap-3">
               <h2 className="text-xl font-bold">Плейлисты</h2>
               <div className="flex gap-2">
                  <Input
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     placeholder="Название плейлиста"
                     className="h-9 w-48"
                     onKeyDown={(e) => e.key === 'Enter' && onCreate()}
                  />
                  <Button size="icon" variant="primary" onClick={onCreate}>
                     <Plus className="h-4 w-4" />
                  </Button>
               </div>
            </div>
            {playlists && playlists.length > 0 ? (
               <div className="flex gap-4 overflow-x-auto pb-2">
                  {playlists.map((pl) => (
                     <Link
                        key={pl._id}
                        href={`/playlist/${pl._id}`}
                        className="block w-40 shrink-0"
                     >
                        <div className="flex aspect-square w-40 items-center justify-center rounded-lg bg-[var(--color-surface)]">
                           {pl.cover ? (
                              <Cover src={pl.cover} alt={pl.title} className="h-40 w-40" />
                           ) : (
                              <ListMusic className="h-10 w-10 text-[var(--color-muted)]" />
                           )}
                        </div>
                        <div className="mt-2 truncate text-sm font-medium">
                           {pl.title}
                        </div>
                     </Link>
                  ))}
               </div>
            ) : (
               <p className="text-sm text-[var(--color-muted)]">
                  Пока нет плейлистов
               </p>
            )}
         </section>

         {library && library.followingArtists.length > 0 && (
            <section className="mb-8">
               <h2 className="mb-3 text-xl font-bold">Подписки</h2>
               <div className="flex gap-4 overflow-x-auto pb-2">
                  {library.followingArtists.map((a) => (
                     <MediaCard
                        key={a._id}
                        title={a.name}
                        cover={a.avatar}
                        href={`/artist/${a._id}`}
                        rounded
                     />
                  ))}
               </div>
            </section>
         )}

         <section>
            <h2 className="mb-3 text-xl font-bold">Любимые треки</h2>
            <TrackList tracks={library?.likedTracks ?? []} />
         </section>
      </div>
   );
}
