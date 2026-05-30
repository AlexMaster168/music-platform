'use client';

import { useParams, useRouter } from 'next/navigation';
import { ListMusic, Play, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
   useDeletePlaylist,
   usePlaylist,
   useRemoveFromPlaylist,
} from '@/hooks/queries';
import { usePlayer } from '@/hooks/usePlayer';
import { useAuth } from '@/hooks/useAuth';
import { Cover } from '@/components/common/Cover';
import { Button } from '@/components/ui/button';
import { TrackList } from '@/components/track/TrackList';

export default function PlaylistPage() {
   const { id } = useParams<{ id: string }>();
   const router = useRouter();
   const { data: playlist, isLoading } = usePlaylist(id);
   const { user } = useAuth();
   const { playList } = usePlayer();
   const removeTrack = useRemoveFromPlaylist();
   const deletePlaylist = useDeletePlaylist();

   if (isLoading) return <p className="text-[var(--color-muted)]">Загрузка...</p>;
   if (!playlist) return <p>Плейлист не найден</p>;

   const tracks = playlist.tracks ?? [];
   const ownerId =
      playlist.ownerId && typeof playlist.ownerId !== 'string'
         ? playlist.ownerId._id
         : playlist.ownerId;
   const isOwner = !!user && ownerId === user._id;

   return (
      <div className="max-w-4xl">
         <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-[var(--color-surface)] shadow-2xl">
               {playlist.cover ? (
                  <Cover src={playlist.cover} alt={playlist.title} className="h-48 w-48" />
               ) : (
                  <ListMusic className="h-16 w-16 text-[var(--color-muted)]" />
               )}
            </div>
            <div className="flex-1">
               <span className="text-xs uppercase text-[var(--color-muted)]">
                  Плейлист
               </span>
               <h1 className="text-3xl font-bold">{playlist.title}</h1>
               {playlist.description && (
                  <p className="mt-1 text-[var(--color-muted)]">
                     {playlist.description}
                  </p>
               )}
               <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {tracks.length} треков
               </p>
               <div className="mt-4 flex items-center gap-2">
                  <Button
                     variant="primary"
                     onClick={() => playList(tracks)}
                     disabled={!tracks.length}
                  >
                     <Play className="h-4 w-4 fill-white" /> Слушать
                  </Button>
                  {isOwner && (
                     <Button
                        variant="outline"
                        onClick={async () => {
                           await deletePlaylist.mutateAsync(id);
                           toast.success('Плейлист удалён');
                           router.push('/library');
                        }}
                     >
                        <Trash2 className="h-4 w-4" /> Удалить
                     </Button>
                  )}
               </div>
            </div>
         </div>

         <section className="mt-8">
            <TrackList
               tracks={tracks}
               onRemove={
                  isOwner
                     ? (t) =>
                          removeTrack.mutate({ playlistId: id, trackId: t._id })
                     : undefined
               }
            />
         </section>
      </div>
   );
}
