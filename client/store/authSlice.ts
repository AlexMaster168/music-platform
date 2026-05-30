import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, tokens } from '@/lib/api';
import type { AuthResponse, IUser } from '@/types';

interface AuthState {
   user: IUser | null;
   status: 'idle' | 'loading' | 'authenticated' | 'guest';
   error: string | null;
}

const initialState: AuthState = {
   user: null,
   status: 'idle',
   error: null,
};

export const loadMe = createAsyncThunk('auth/loadMe', async () => {
   if (!tokens.access) throw new Error('no token');
   return api<IUser>('/auth/me');
});

export const login = createAsyncThunk(
   'auth/login',
   async (payload: { email: string; password: string }) => {
      const data = await api<AuthResponse>('/auth/login', {
         method: 'POST',
         auth: false,
         body: JSON.stringify(payload),
      });
      tokens.set(data.accessToken, data.refreshToken);
      return data.user;
   },
);

export const register = createAsyncThunk(
   'auth/register',
   async (payload: { email: string; password: string; displayName: string }) => {
      const data = await api<AuthResponse>('/auth/register', {
         method: 'POST',
         auth: false,
         body: JSON.stringify(payload),
      });
      tokens.set(data.accessToken, data.refreshToken);
      return data.user;
   },
);

const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      logout(state) {
         tokens.clear();
         state.user = null;
         state.status = 'guest';
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(loadMe.pending, (state) => {
            state.status = 'loading';
         })
         .addCase(loadMe.fulfilled, (state, action) => {
            state.user = action.payload;
            state.status = 'authenticated';
         })
         .addCase(loadMe.rejected, (state) => {
            state.user = null;
            state.status = 'guest';
         })
         .addCase(login.fulfilled, (state, action) => {
            state.user = action.payload;
            state.status = 'authenticated';
            state.error = null;
         })
         .addCase(register.fulfilled, (state, action) => {
            state.user = action.payload;
            state.status = 'authenticated';
            state.error = null;
         });
   },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
