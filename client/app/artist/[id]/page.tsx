'use client';

import { useParams } from 'next/navigation';
import { Play, UserCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
   useArtist,
   useFollowingIds,
   useToggleFollow,
} from '@/hooks/queries';
import { usePlayer } from '@/hooks/usePlayer';
import { useAuth } from '@/hooks/useAuth';
import { Cover } from '@/components/common/Cover';
import { Button } from '@/components/ui/button';
import { TrackList } from '@/components/track/TrackList';
import { MediaCard } from '@/components/media/MediaCard';
import { formatCount } from '@/lib/utils';

export default function ArtistPage() {
   const { id } = useParams<{ id: string }>();
   const { data, isLoading } = useArtist(id);
   const { isAuthed } = useAuth();
   const following = useFollowingIds(isAuthed).has(id);
   const toggleFollow = useToggleFollow();
   const { playList } = usePlayer();

   if (isLoading) return <p className="text-[var(--color-muted)]">Загрузка...</p>;
   if (!data) return <p>Артист не найден</p>;

   const { artist, tracks, albums } = data;

   return (
      <div>
         <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
            <Cover
               src={artist.avatar}
               alt={artist.name}
               rounded
               className="h-40 w-40 shadow-2xl"
            />
            <div className="flex-1 text-center sm:text-left">
               <h1 className="text-4xl font-bold">{artist.name}</h1>
               <p className="mt-1 text-[var(--color-muted)]">
                  {formatCount(artist.followersCount)} подписчиков
               </p>
               {artist.bio && (
                  <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
                     {artist.bio}
                  </p>
               )}
               <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Button
                     variant="primary"
                     onClick={() => playList(tracks)}
                     disabled={!tracks.length}
                  >
                     <Play className="h-4 w-4 fill-white" /> Слушать
                  </Button>
                  <Button
                     variant="outline"
                     onClick={() => {
                        if (!isAuthed) return toast.error('Войди, чтобы подписаться');
                        toggleFollow.mutate({ artistId: id, following });
                     }}
                  >
                     {following ? (
                        <>
                           <UserCheck className="h-4 w-4" /> Вы подписаны
                        </>
                     ) : (
                        <>
                           <UserPlus className="h-4 w-4" /> Подписаться
                        </>
                     )}
                  </Button>
               </div>
            </div>
         </div>

         <section className="mt-8">
            <h2 className="mb-3 text-xl font-bold">Популярные треки</h2>
            <TrackList tracks={tracks} />
         </section>

         {albums.length > 0 && (
            <section className="mt-8">
               <h2 className="mb-3 text-xl font-bold">Альбомы</h2>
               <div className="flex gap-4 overflow-x-auto pb-2">
                  {albums.map((a) => (
                     <MediaCard
                        key={a._id}
                        title={a.title}
                        subtitle={a.type ?? 'album'}
                        cover={a.cover}
                        href={`/album/${a._id}`}
                     />
                  ))}
               </div>
            </section>
         )}
      </div>
   );
}
