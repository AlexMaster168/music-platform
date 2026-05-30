'use client';

import Link from 'next/link';
import {
   ChevronUp,
   Heart,
   ListMusic,
   Pause,
   Play,
   Repeat,
   Repeat1,
   Shuffle,
   SkipBack,
   SkipForward,
   Volume2,
   VolumeX,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector, useCurrentTrack } from '@/store/hooks';
import {
   requestSeek,
   setVolume,
   toggleFullscreen,
   toggleMute,
   togglePlay,
   toggleQueue,
} from '@/store/playerSlice';
import { cycleRepeat, next, prev, toggleShuffle } from '@/store/queueSlice';
import { Cover } from '@/components/common/Cover';
import { cn, formatTime } from '@/lib/utils';
import { artistOf } from '@/types';
import { useLikedIds, useToggleLike } from '@/hooks/queries';
import { useAuth } from '@/hooks/useAuth';

export function PlayerBar() {
   const dispatch = useAppDispatch();
   const track = useCurrentTrack();
   const { isPlaying, currentTime, duration, volume, muted } = useAppSelector(
      (s) => s.player,
   );
   const { shuffle, repeat } = useAppSelector((s) => s.queue);
   const { isAuthed } = useAuth();
   const liked = useLikedIds(isAuthed).has(track?._id ?? '');
   const toggleLike = useToggleLike();

   if (!track) return null;

   const artist = artistOf(track);

   const onPrev = () => {
      if (currentTime > 3) dispatch(requestSeek(0));
      else dispatch(prev());
   };

   const onLike = () => {
      if (!isAuthed) return toast.error('Войди, чтобы лайкать');
      toggleLike.mutate({ trackId: track._id, liked });
   };

   return (
      <div className="flex h-20 shrink-0 items-center gap-3 border-t border-[var(--color-line)] bg-[var(--color-elevated)] px-3 md:px-4">
         {/* Инфо о треке */}
         <div className="flex min-w-0 flex-1 items-center gap-3">
            <button onClick={() => dispatch(toggleFullscreen())} className="shrink-0">
               <Cover src={track.picture} alt={track.name} className="h-14 w-14" />
            </button>
            <div className="min-w-0">
               <div className="truncate text-sm font-medium">{track.name}</div>
               <div className="truncate text-xs text-[var(--color-muted)]">
                  {artist ? (
                     <Link href={`/artist/${artist._id}`} className="hover:underline">
                        {artist.name}
                     </Link>
                  ) : (
                     'Unknown artist'
                  )}
               </div>
            </div>
            <button onClick={onLike} className="ml-1 shrink-0" aria-label="Нравится">
               <Heart
                  className={cn(
                     'h-5 w-5',
                     liked
                        ? 'fill-[var(--color-brand)] text-[var(--color-brand)]'
                        : 'text-[var(--color-muted)] hover:text-white',
                  )}
               />
            </button>
         </div>

         {/* Контролы + прогресс */}
         <div className="flex max-w-2xl flex-[2] flex-col items-center gap-1">
            <div className="flex items-center gap-4">
               <button
                  onClick={() => dispatch(toggleShuffle())}
                  aria-label="Перемешать"
                  className={cn(
                     'hidden sm:block',
                     shuffle ? 'text-[var(--color-brand)]' : 'text-[var(--color-muted)] hover:text-white',
                  )}
               >
                  <Shuffle className="h-4 w-4" />
               </button>
               <button onClick={onPrev} className="text-white" aria-label="Назад">
                  <SkipBack className="h-5 w-5 fill-white" />
               </button>
               <button
                  onClick={() => dispatch(togglePlay())}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform"
                  aria-label={isPlaying ? 'Пауза' : 'Играть'}
               >
                  {isPlaying ? (
                     <Pause className="h-5 w-5 fill-black" />
                  ) : (
                     <Play className="h-5 w-5 fill-black" />
                  )}
               </button>
               <button onClick={() => dispatch(next())} className="text-white" aria-label="Вперёд">
                  <SkipForward className="h-5 w-5 fill-white" />
               </button>
               <button
                  onClick={() => dispatch(cycleRepeat())}
                  aria-label="Повтор"
                  className={cn(
                     'hidden sm:block',
                     repeat !== 'off'
                        ? 'text-[var(--color-brand)]'
                        : 'text-[var(--color-muted)] hover:text-white',
                  )}
               >
                  {repeat === 'one' ? (
                     <Repeat1 className="h-4 w-4" />
                  ) : (
                     <Repeat className="h-4 w-4" />
                  )}
               </button>
            </div>

            <div className="flex w-full items-center gap-2">
               <span className="w-10 text-right text-[10px] text-[var(--color-muted)]">
                  {formatTime(currentTime)}
               </span>
               <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => dispatch(requestSeek(Number(e.target.value)))}
                  className="h-1 flex-1 cursor-pointer accent-[var(--color-brand)]"
               />
               <span className="w-10 text-[10px] text-[var(--color-muted)]">
                  {formatTime(duration)}
               </span>
            </div>
         </div>

         {/* Громкость + очередь + фуллскрин */}
         <div className="hidden flex-1 items-center justify-end gap-3 lg:flex">
            <button
               onClick={() => dispatch(toggleMute())}
               className="text-[var(--color-muted)] hover:text-white"
               aria-label="Звук"
            >
               {muted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
               ) : (
                  <Volume2 className="h-5 w-5" />
               )}
            </button>
            <input
               type="range"
               min={0}
               max={1}
               step={0.01}
               value={muted ? 0 : volume}
               onChange={(e) => dispatch(setVolume(Number(e.target.value)))}
               className="h-1 w-24 cursor-pointer accent-[var(--color-brand)]"
            />
            <button
               onClick={() => dispatch(toggleQueue())}
               className="text-[var(--color-muted)] hover:text-white"
               aria-label="Очередь"
            >
               <ListMusic className="h-5 w-5" />
            </button>
            <button
               onClick={() => dispatch(toggleFullscreen())}
               className="text-[var(--color-muted)] hover:text-white"
               aria-label="На весь экран"
            >
               <ChevronUp className="h-5 w-5" />
            </button>
         </div>
      </div>
   );
}
