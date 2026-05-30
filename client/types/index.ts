export interface IArtist {
   _id: string;
   name: string;
   avatar?: string;
   banner?: string;
   bio?: string;
   genres?: string[];
   languages?: string[];
   followersCount?: number;
}

export interface IAlbum {
   _id: string;
   title: string;
   artistId?: IArtist | string;
   cover?: string;
   releaseDate?: string;
   type?: 'album' | 'single' | 'ep';
   language?: string;
   genres?: string[];
}

export interface IComment {
   _id: string;
   username: string;
   text: string;
   userId?: { _id: string; displayName?: string; avatar?: string } | string;
   createdAt?: string;
}

export interface ITrack {
   _id: string;
   name: string;
   artistId?: IArtist | string;
   albumId?: IAlbum | string;
   audio: string;
   picture?: string;
   duration?: number;
   listens?: number;
   genres?: string[];
   language?: string;
   isCover?: boolean;
   originalTrackId?: ITrack | string;
   lyrics?: string;
   comments?: IComment[];
   isLiked?: boolean;
   covers?: ITrack[];
   createdAt?: string;
}

export interface IUser {
   _id: string;
   email: string;
   displayName: string;
   avatar?: string;
   role?: string;
   likedTracks?: string[];
   followingArtists?: string[];
}

export interface IPlaylist {
   _id: string;
   title: string;
   description?: string;
   cover?: string;
   ownerId?: IUser | string;
   tracks?: ITrack[];
   isPublic?: boolean;
   updatedAt?: string;
}

export interface AuthResponse {
   accessToken: string;
   refreshToken: string;
   user: IUser;
}

export interface HomeFeed {
   trending: ITrack[];
   fresh: ITrack[];
   covers: ITrack[];
   albums: IAlbum[];
   languages: string[];
   genres: string[];
   history: ITrack[];
}

export interface SearchResult {
   tracks: ITrack[];
   artists: IArtist[];
   albums: IAlbum[];
   playlists: IPlaylist[];
}

export interface Library {
   likedTracks: ITrack[];
   followingArtists: IArtist[];
}

export interface ArtistPage {
   artist: IArtist;
   tracks: ITrack[];
   albums: IAlbum[];
}

export interface AlbumPage {
   album: IAlbum;
   tracks: ITrack[];
}

/** Достаёт имя артиста независимо от того, populated объект или строка. */
export function artistName(entity?: { artistId?: IArtist | string }): string {
   const a = entity?.artistId;
   if (!a) return 'Unknown artist';
   if (typeof a === 'string') return 'Unknown artist';
   return a.name;
}

export function artistOf(entity?: { artistId?: IArtist | string }): IArtist | undefined {
   const a = entity?.artistId;
   return a && typeof a !== 'string' ? a : undefined;
}
