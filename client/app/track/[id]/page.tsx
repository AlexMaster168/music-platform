'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Heart, ListEnd, Play } from 'lucide-react';
import { toast } from 'sonner';
import {
   useAddComment,
   useSimilar,
   useToggleLike,
   useTrack,
} from '@/hooks/queries';
import { usePlayer } from '@/hooks/usePlayer';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/store/hooks';
import { addToQueue } from '@/store/queueSlice';
import { Cover } from '@/components/common/Cover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MediaCard } from '@/components/media/MediaCard';
import { TrackList } from '@/components/track/TrackList';
import { TrackAdminPanel } from '@/components/track/TrackAdminPanel';
import { AddToPlaylistButton } from '@/components/playlist/AddToPlaylistButton';
import { artistName, artistOf, type ITrack } from '@/types';
import { cn, formatCount, languageName } from '@/lib/utils';

export default function TrackPage() {
   const { id } = useParams<{ id: string }>();
   const dispatch = useAppDispatch();
   const { data: track, isLoading } = useTrack(id);
   const { data: similar } = useSimilar(id);
   const { isAuthed } = useAuth();
   const { playOne } = usePlayer();
   const toggleLike = useToggleLike();
   const addComment = useAddComment();
   const [comment, setComment] = useState('');

   if (isLoading) return <p className="text-[var(--color-muted)]">Загрузка...</p>;
   if (!track) return <p>Трек не найден</p>;

   const artist = artistOf(track);
   const original =
      track.originalTrackId && typeof track.originalTrackId !== 'string'
         ? track.originalTrackId
         : null;

   const onComment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!comment.trim()) return;
      await addComment.mutateAsync({ trackId: track._id, text: comment.trim() });
      setComment('');
      toast.success('Комментарий добавлен');
   };

   return (
      <div className="max-w-4xl">
         <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            <Cover
               src={track.picture}
               alt={track.name}
               className="h-48 w-48 shadow-2xl"
            />
            <div className="flex-1">
               <div className="mb-1 flex items-center gap-2 text-xs text-[var(--color-muted)]">
                  {track.language && (
                     <span className="rounded bg-white/10 px-2 py-0.5">
                        {languageName(track.language)}
                     </span>
                  )}
                  {track.isCover && (
                     <span className="rounded bg-white/10 px-2 py-0.5 uppercase">
                        cover
                     </span>
                  )}
               </div>
               <h1 className="text-3xl font-bold">{track.name}</h1>
               <p className="mt-1 text-[var(--color-muted)]">
                  {artist ? (
                     <Link href={`/artist/${artist._id}`} className="hover:underline">
                        {artist.name}
                     </Link>
                  ) : (
                     artistName(track)
                  )}{' '}
                  · {formatCount(track.listens)} прослушиваний
               </p>
               {original && (
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                     Кавер на{' '}
                     <Link
                        href={`/track/${original._id}`}
                        className="text-white hover:underline"
                     >
                        {original.name}
                     </Link>
                  </p>
               )}

               <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button variant="primary" onClick={() => playOne(track)}>
                     <Play className="h-4 w-4 fill-white" /> Слушать
                  </Button>
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={() => {
                        if (!isAuthed) return toast.error('Войди, чтобы лайкать');
                        toggleLike.mutate({ trackId: track._id, liked: !!track.isLiked });
                     }}
                  >
                     <Heart
                        className={cn(
                           'h-4 w-4',
                           track.isLiked &&
                              'fill-[var(--color-brand)] text-[var(--color-brand)]',
                        )}
                     />
                     {track.isLiked ? 'В любимом' : 'Нравится'}
                  </Button>
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={() => {
                        dispatch(addToQueue(track));
                        toast.success('Добавлено в очередь');
                     }}
                  >
                     <ListEnd className="h-4 w-4" /> В очередь
                  </Button>
                  <AddToPlaylistButton trackId={track._id} />
               </div>

               <TrackAdminPanel track={track} />
            </div>
         </div>

         {track.lyrics && (
            <section className="mt-8">
               <h2 className="mb-2 text-xl font-bold">Текст</h2>
               <p className="whitespace-pre-line text-[var(--color-muted)] leading-7">
                  {track.lyrics}
               </p>
            </section>
         )}

         {track.covers && track.covers.length > 0 && (
            <section className="mt-8">
               <h2 className="mb-3 text-xl font-bold">Каверы</h2>
               <div className="flex gap-4 overflow-x-auto pb-2">
                  {track.covers.map((c: ITrack) => (
                     <MediaCard
                        key={c._id}
                        title={c.name}
                        subtitle={artistName(c)}
                        cover={c.picture}
                        href={`/track/${c._id}`}
                        onPlay={() => playOne(c)}
                     />
                  ))}
               </div>
            </section>
         )}

         {similar && similar.length > 0 && (
            <section className="mt-8">
               <h2 className="mb-3 text-xl font-bold">Похожие треки</h2>
               <TrackList tracks={similar} />
            </section>
         )}

         <section className="mt-8">
            <h2 className="mb-3 text-xl font-bold">
               Комментарии ({track.comments?.length ?? 0})
            </h2>
            {isAuthed ? (
               <form onSubmit={onComment} className="mb-4 flex gap-2">
                  <Input
                     value={comment}
                     onChange={(e) => setComment(e.target.value)}
                     placeholder="Оставить комментарий"
                  />
                  <Button type="submit" variant="primary">
                     Отправить
                  </Button>
               </form>
            ) : (
               <p className="mb-4 text-sm text-[var(--color-muted)]">
                  <Link href="/login" className="text-white hover:underline">
                     Войди
                  </Link>
                  , чтобы комментировать
               </p>
            )}
            <div className="flex flex-col gap-3">
               {(track.comments ?? []).map((c) => (
                  <div
                     key={c._id}
                     className="rounded-lg bg-[var(--color-surface)] px-4 py-3"
                  >
                     <div className="text-sm font-medium">{c.username}</div>
                     <div className="text-sm text-[var(--color-muted)]">{c.text}</div>
                  </div>
               ))}
            </div>
         </section>
      </div>
   );
}
