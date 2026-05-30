import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ITrack } from '@/types';

export type RepeatMode = 'off' | 'all' | 'one';

interface QueueState {
   items: ITrack[];
   index: number;
   shuffle: boolean;
   repeat: RepeatMode;
   /** исходный порядок до перемешивания (для восстановления) */
   original: ITrack[];
}

const initialState: QueueState = {
   items: [],
   index: 0,
   shuffle: false,
   repeat: 'off',
   original: [],
};

function shuffleArray<T>(arr: T[]): T[] {
   const a = [...arr];
   for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
   }
   return a;
}

const queueSlice = createSlice({
   name: 'queue',
   initialState,
   reducers: {
      playTracks(
         state,
         action: PayloadAction<{ tracks: ITrack[]; startIndex?: number }>,
      ) {
         const { tracks, startIndex = 0 } = action.payload;
         if (!tracks.length) return;
         state.original = [];
         if (state.shuffle) {
            const selected = tracks[startIndex];
            const rest = tracks.filter((_, i) => i !== startIndex);
            state.items = [selected, ...shuffleArray(rest)];
            state.index = 0;
         } else {
            state.items = tracks;
            state.index = startIndex;
         }
      },
      next(state) {
         const last = state.items.length - 1;
         if (state.index < last) state.index += 1;
         else if (state.repeat === 'all') state.index = 0;
      },
      prev(state) {
         state.index = Math.max(0, state.index - 1);
      },
      jumpTo(state, action: PayloadAction<number>) {
         if (action.payload >= 0 && action.payload < state.items.length) {
            state.index = action.payload;
         }
      },
      addToQueue(state, action: PayloadAction<ITrack>) {
         state.items.push(action.payload);
      },
      playNextInQueue(state, action: PayloadAction<ITrack>) {
         state.items.splice(state.index + 1, 0, action.payload);
      },
      removeAt(state, action: PayloadAction<number>) {
         const i = action.payload;
         state.items.splice(i, 1);
         if (i < state.index) state.index -= 1;
         if (state.index >= state.items.length) {
            state.index = Math.max(0, state.items.length - 1);
         }
      },
      clearQueue(state) {
         state.items = [];
         state.index = 0;
         state.original = [];
      },
      toggleShuffle(state) {
         state.shuffle = !state.shuffle;
         const current = state.items[state.index];
         if (state.shuffle) {
            state.original = [...state.items];
            const rest = state.items.filter((_, i) => i !== state.index);
            state.items = current ? [current, ...shuffleArray(rest)] : shuffleArray(rest);
            state.index = 0;
         } else if (state.original.length) {
            state.items = state.original;
            state.index = Math.max(
               0,
               state.items.findIndex((t) => t._id === current?._id),
            );
            state.original = [];
         }
      },
      cycleRepeat(state) {
         state.repeat =
            state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off';
      },
   },
});

export const {
   playTracks,
   next,
   prev,
   jumpTo,
   addToQueue,
   playNextInQueue,
   removeAt,
   clearQueue,
   toggleShuffle,
   cycleRepeat,
} = queueSlice.actions;
export default queueSlice.reducer;
