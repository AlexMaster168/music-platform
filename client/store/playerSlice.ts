import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PlayerState {
   isPlaying: boolean;
   currentTime: number;
   duration: number;
   volume: number; // 0..1
   muted: boolean;
   /** запрос на перемотку (читается AudioEngine, потом сбрасывается) */
   seekTo: number | null;
   fullscreen: boolean;
   queueOpen: boolean;
}

const initialState: PlayerState = {
   isPlaying: false,
   currentTime: 0,
   duration: 0,
   volume: 0.8,
   muted: false,
   seekTo: null,
   fullscreen: false,
   queueOpen: false,
};

const playerSlice = createSlice({
   name: 'player',
   initialState,
   reducers: {
      play(state) {
         state.isPlaying = true;
      },
      pause(state) {
         state.isPlaying = false;
      },
      togglePlay(state) {
         state.isPlaying = !state.isPlaying;
      },
      setCurrentTime(state, action: PayloadAction<number>) {
         state.currentTime = action.payload;
      },
      setDuration(state, action: PayloadAction<number>) {
         state.duration = action.payload;
      },
      setVolume(state, action: PayloadAction<number>) {
         state.volume = Math.min(1, Math.max(0, action.payload));
         state.muted = state.volume === 0;
      },
      toggleMute(state) {
         state.muted = !state.muted;
      },
      requestSeek(state, action: PayloadAction<number>) {
         state.seekTo = action.payload;
         state.currentTime = action.payload;
      },
      clearSeek(state) {
         state.seekTo = null;
      },
      toggleFullscreen(state) {
         state.fullscreen = !state.fullscreen;
      },
      setFullscreen(state, action: PayloadAction<boolean>) {
         state.fullscreen = action.payload;
      },
      toggleQueue(state) {
         state.queueOpen = !state.queueOpen;
      },
   },
});

export const {
   play,
   pause,
   togglePlay,
   setCurrentTime,
   setDuration,
   setVolume,
   toggleMute,
   requestSeek,
   clearSeek,
   toggleFullscreen,
   setFullscreen,
   toggleQueue,
} = playerSlice.actions;
export default playerSlice.reducer;
