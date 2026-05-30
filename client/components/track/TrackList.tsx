'use client';

import type { ITrack } from '@/types';
import { TrackRow } from './TrackRow';

export function TrackList({
   tracks,
   showIndex,
   onRemove,
}: {
   tracks: ITrack[];
   showIndex?: boolean;
   onRemove?: (track: ITrack) => void;
}) {
   if (!tracks.length) {
      return (
         <p className="py-6 text-sm text-[var(--color-muted)]">Треков пока нет</p>
      );
   }
   return (
      <div className="flex flex-col">
         {tracks.map((t, i) => (
            <TrackRow
               key={t._id}
               track={t}
               queue={tracks}
               index={i}
               showIndex={showIndex}
               onRemove={onRemove ? () => onRemove(t) : undefined}
            />
         ))}
      </div>
   );
}
