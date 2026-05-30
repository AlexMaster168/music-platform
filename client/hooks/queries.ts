import {
   useMutation,
   useQuery,
   useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
   AlbumPage,
   ArtistPage,
   HomeFeed,
   IArtist,
   IPlaylist,
   ITrack,
   Library,
   SearchResult,
} from '@/types';

// ===== Queries =====
export const useHome = () =>
   useQuery({ queryKey: ['home'], queryFn: () => api<HomeFeed>('/home') });

export const useTracks = (filters: {
   language?: string;
   genre?: string;
   search?: string;
} = {}) => {
   const params = new URLSearchParams();
   if (filters.language) params.set('language', filters.language);
   if (filters.genre) params.set('genre', filters.genre);
   if (filters.search) params.set('search', filters.search);
   const qs = params.toString();
   return useQuery({
      queryKey: ['tracks', filters],
      queryFn: () => api<ITrack[]>(`/tracks${qs ? `?${qs}` : ''}`),
   });
};

export const useTrack = (id: string) =>
   useQuery({
      queryKey: ['track', id],
      queryFn: () => api<ITrack>(`/tracks/${id}`),
      enabled: !!id,
   });

export const useSimilar = (id: string) =>
   useQuery({
      queryKey: ['similar', id],
      queryFn: () => api<ITrack[]>(`/tracks/${id}/similar`),
      enabled: !!id,
   });

export const useArtist = (id: string) =>
   useQuery({
      queryKey: ['artist', id],
      queryFn: () => api<ArtistPage>(`/artists/${id}`),
      enabled: !!id,
   });

export const useAlbum = (id: string) =>
   useQuery({
      queryKey: ['album', id],
      queryFn: () => api<AlbumPage>(`/albums/${id}`),
      enabled: !!id,
   });

export const usePlaylist = (id: string) =>
   useQuery({
      queryKey: ['playlist', id],
      queryFn: () => api<IPlaylist>(`/playlists/${id}`),
      enabled: !!id,
   });

export const useMyPlaylists = (enabled = true) =>
   useQuery({
      queryKey: ['my-playlists'],
      queryFn: () => api<IPlaylist[]>('/playlists/me'),
      enabled,
   });

export const useLibrary = (enabled = true) =>
   useQuery({
      queryKey: ['library'],
      queryFn: () => api<Library>('/users/me/library'),
      enabled,
   });

export const useSearch = (
   q: string,
   type = 'all',
   language?: string,
   genre?: string,
) => {
   const params = new URLSearchParams({ q, type });
   if (language) params.set('language', language);
   if (genre) params.set('genre', genre);
   return useQuery({
      queryKey: ['search', q, type, language, genre],
      queryFn: () => api<SearchResult>(`/search?${params.toString()}`),
      enabled: q.trim().length > 0,
   });
};

export const useArtists = () =>
   useQuery({ queryKey: ['artists'], queryFn: () => api<IArtist[]>('/artists') });

// ===== Mutations =====
export const useUploadTrack = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (form: FormData) =>
         api<ITrack>('/tracks', { method: 'POST', body: form }),
      onSuccess: () => {
         qc.invalidateQueries({ queryKey: ['tracks'] });
         qc.invalidateQueries({ queryKey: ['home'] });
      },
   });
};

export const useDeleteTrack = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (id: string) => api(`/tracks/${id}`, { method: 'DELETE' }),
      onSuccess: () => {
         qc.invalidateQueries({ queryKey: ['tracks'] });
         qc.invalidateQueries({ queryKey: ['home'] });
      },
   });
};

export const useUpdateTrack = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
         api<ITrack>(`/tracks/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
         }),
      onSuccess: (_d, vars) => {
         qc.invalidateQueries({ queryKey: ['track', vars.id] });
         qc.invalidateQueries({ queryKey: ['tracks'] });
         qc.invalidateQueries({ queryKey: ['home'] });
      },
   });
};

export const useToggleLike = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: ({ trackId, liked }: { trackId: string; liked: boolean }) =>
         api(`/users/me/likes/${trackId}`, {
            method: liked ? 'DELETE' : 'POST',
         }),
      onSuccess: (_d, vars) => {
         qc.invalidateQueries({ queryKey: ['library'] });
         qc.invalidateQueries({ queryKey: ['track', vars.trackId] });
      },
   });
};

export const useToggleFollow = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: ({ artistId, following }: { artistId: string; following: boolean }) =>
         api(`/users/me/following/${artistId}`, {
            method: following ? 'DELETE' : 'POST',
         }),
      onSuccess: (_d, vars) => {
         qc.invalidateQueries({ queryKey: ['library'] });
         qc.invalidateQueries({ queryKey: ['artist', vars.artistId] });
      },
   });
};

export const useCreatePlaylist = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (body: { title: string; description?: string }) =>
         api<IPlaylist>('/playlists', {
            method: 'POST',
            body: JSON.stringify(body),
         }),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['my-playlists'] }),
   });
};

export const useDeletePlaylist = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (id: string) => api(`/playlists/${id}`, { method: 'DELETE' }),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['my-playlists'] }),
   });
};

export const useAddToPlaylist = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: ({ playlistId, trackId }: { playlistId: string; trackId: string }) =>
         api(`/playlists/${playlistId}/tracks/${trackId}`, { method: 'POST' }),
      onSuccess: (_d, vars) => {
         qc.invalidateQueries({ queryKey: ['playlist', vars.playlistId] });
         qc.invalidateQueries({ queryKey: ['my-playlists'] });
      },
   });
};

export const useRemoveFromPlaylist = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: ({ playlistId, trackId }: { playlistId: string; trackId: string }) =>
         api(`/playlists/${playlistId}/tracks/${trackId}`, { method: 'DELETE' }),
      onSuccess: (_d, vars) =>
         qc.invalidateQueries({ queryKey: ['playlist', vars.playlistId] }),
   });
};

export const useAddComment = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: (body: { trackId: string; text: string }) =>
         api('/tracks/comment', { method: 'POST', body: JSON.stringify(body) }),
      onSuccess: (_d, vars) =>
         qc.invalidateQueries({ queryKey: ['track', vars.trackId] }),
   });
};

/** Засчитать прослушивание (fire-and-forget). */
export const recordListen = (trackId: string) =>
   api(`/tracks/listen/${trackId}`, { method: 'POST' }).catch(() => {});

/** Множество id лайкнутых треков (для подсветки сердечек в списках). */
export const useLikedIds = (enabled: boolean): Set<string> => {
   const { data } = useLibrary(enabled);
   return new Set((data?.likedTracks ?? []).map((t) => t._id));
};

/** Множество id артистов, на которых подписан пользователь. */
export const useFollowingIds = (enabled: boolean): Set<string> => {
   const { data } = useLibrary(enabled);
   return new Set((data?.followingArtists ?? []).map((a) => a._id));
};
