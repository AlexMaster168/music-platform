'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector, useCurrentTrack } from '@/store/hooks';
import { toggleFullscreen } from '@/store/playerSlice';
import { Cover } from '@/components/common/Cover';
import { artistOf } from '@/types';
import { languageName } from '@/lib/utils';

export function FullScreenPlayer() {
   const dispatch = useAppDispatch();
   const open = useAppSelector((s) => s.player.fullscreen);
   const track = useCurrentTrack();

   if (!open || !track) return null;

   const artist = artistOf(track);

   return (
      <div className="fixed inset-x-0 bottom-20 top-0 z-40 overflow-y-auto bg-gradient-to-b from-[#1a1a1a] to-[var(--color-base)]">
         <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-8">
            <button
               onClick={() => dispatch(toggleFullscreen())}
               className="self-start text-[var(--color-muted)] hover:text-white"
               aria-label="Свернуть"
            >
               <ChevronDown className="h-7 w-7" />
            </button>

            <Cover
               src={track.picture}
               alt={track.name}
               className="h-64 w-64 shadow-2xl md:h-80 md:w-80"
            />

            <div className="text-center">
               <h1 className="text-3xl font-bold">{track.name}</h1>
               <p className="mt-1 text-lg text-[var(--color-muted)]">
                  {artist ? (
                     <Link
                        href={`/artist/${artist._id}`}
                        onClick={() => dispatch(toggleFullscreen())}
                        className="hover:text-white hover:underline"
                     >
                        {artist.name}
                     </Link>
                  ) : (
                     'Unknown artist'
                  )}
               </p>
               <div className="mt-2 flex items-center justify-center gap-2 text-xs text-[var(--color-muted)]">
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
                  {track.genres?.map((g) => (
                     <span key={g} className="rounded bg-white/10 px-2 py-0.5">
                        {g}
                     </span>
                  ))}
               </div>
            </div>

            {track.lyrics && (
               <div className="w-full max-w-xl whitespace-pre-line text-center text-[var(--color-muted)] leading-8">
                  {track.lyrics}
               </div>
            )}
         </div>
      </div>
   );
}
