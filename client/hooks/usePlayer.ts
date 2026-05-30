'use client';

import { useAppDispatch } from '@/store/hooks';
import { playTracks } from '@/store/queueSlice';
import { play } from '@/store/playerSlice';
import type { ITrack } from '@/types';

export const usePlayer = () => {
   const dispatch = useAppDispatch();
   return {
      playList: (tracks: ITrack[], startIndex = 0) => {
         if (!tracks.length) return;
         dispatch(playTracks({ tracks, startIndex }));
         dispatch(play());
      },
      playOne: (track: ITrack) => {
         dispatch(playTracks({ tracks: [track], startIndex: 0 }));
         dispatch(play());
      },
   };
};
