import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import playerReducer from './playerSlice';
import queueReducer from './queueSlice';

export const makeStore = () =>
   configureStore({
      reducer: {
         auth: authReducer,
         player: playerReducer,
         queue: queueReducer,
      },
   });

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
