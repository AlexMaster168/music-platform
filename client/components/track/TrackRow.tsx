'use client';

import Link from 'next/link';
import { Heart, ListPlus, Pause, Play, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ITrack } from '@/types';
import { artistName, artistOf } from '@/types';
import { useAppDispatch, useAppSelector, useCurrentTrack } from '@/store/hooks';
import { playTracks, addToQueue } from '@/store/queueSlice';
import { play, togglePlay } from '@/store/playerSlice';
import { Cover } from '@/components/common/Cover';
import { cn, formatCount, formatTime, languageName } from '@/lib/utils';
import { useToggleLike, useLikedIds } from '@/hooks/queries';
import { useAuth } from '@/hooks/useAuth';

interface TrackRowProps {
   track: ITrack;
   queue: ITrack[];
   index: number;
   showIndex?: boolean;
   onRemove?: () => void;
}

export function TrackRow({ track, queue, index, showIndex, onRemove }: TrackRowProps) {
   const dispatch = useAppDispatch();
   const current = useCurrentTrack();
   const isPlaying = useAppSelector((s) => s.player.isPlaying);
   const { isAuthed } = useAuth();
   const liked = useLikedIds(isAuthed).has(track._id);
   const toggleLike = useToggleLike();

   const isCurrent = current?._id === track._id;
   const artist = artistOf(track);

   const onPlay = () => {
      if (isCurrent) {
         dispatch(togglePlay());
      } else {
         dispatch(playTracks({ tracks: queue, startIndex: index }));
         dispatch(play());
      }
   };

   const onLike = () => {
      if (!isAuthed) {
         toast.error('Войди, чтобы лайкать треки');
         return;
      }
      toggleLike.mutate({ trackId: track._id, liked });
   };

   return (
      <div
         className={cn(
            'group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors',
            isCurrent && 'bg-white/5',
         )}
      >
         <button
            onClick={onPlay}
            className="relative h-11 w-11 shrink-0"
            aria-label="Играть"
         >
            <Cover src={track.picture} alt={track.name} className="h-11 w-11" />
            <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
               {isCurrent && isPlaying ? (
                  <Pause className="h-5 w-5 fill-white" />
               ) : (
                  <Play className="h-5 w-5 fill-white" />
               )}
            </span>
         </button>

         <div className="min-w-0 flex-1">
            <div
               className={cn(
                  'truncate text-sm font-medium',
                  isCurrent && 'text-[var(--color-brand)]',
               )}
            >
               {track.name}
               {track.isCover && (
                  <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase text-[var(--color-muted)]">
                     cover
                  </span>
               )}
            </div>
            <div className="truncate text-xs text-[var(--color-muted)]">
               {artist ? (
                  <Link
                     href={`/artist/${artist._id}`}
                     className="hover:text-white hover:underline"
                  >
                     {artist.name}
                  </Link>
               ) : (
                  artistName(track)
               )}
               {track.language && <span> · {languageName(track.language)}</span>}
            </div>
         </div>

         <span className="hidden w-16 text-right text-xs text-[var(--color-muted)] sm:block">
            {formatCount(track.listens)} ▶
         </span>

         <button
            onClick={onLike}
            className={cn(
               'opacity-0 group-hover:opacity-100 transition-opacity',
               liked && 'opacity-100',
            )}
            aria-label="Нравится"
         >
            <Heart
               className={cn(
                  'h-4 w-4',
                  liked ? 'fill-[var(--color-brand)] text-[var(--color-brand)]' : 'text-[var(--color-muted)]',
               )}
            />
         </button>

         <button
            onClick={() => {
               dispatch(addToQueue(track));
               toast.success('Добавлено в очередь');
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-muted)] hover:text-white"
            aria-label="В очередь"
         >
            <ListPlus className="h-4 w-4" />
         </button>

         <span className="w-10 text-right text-xs text-[var(--color-muted)]">
            {formatTime(track.duration)}
         </span>

         {onRemove && (
            <button
               onClick={onRemove}
               className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-muted)] hover:text-white"
               aria-label="Удалить из плейлиста"
            >
               <X className="h-4 w-4" />
            </button>
         )}
      </div>
   );
}
