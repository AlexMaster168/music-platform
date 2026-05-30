import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Track, TrackDocument } from '../track/schemas/track.schema';
import { Artist, ArtistDocument } from '../artist/schemas/artist.schema';
import { Album, AlbumDocument } from '../album/schemas/album.schema';
import { Playlist, PlaylistDocument } from '../playlist/schemas/playlist.schema';

export type SearchType = 'all' | 'tracks' | 'artists' | 'albums' | 'playlists';

@Injectable()
export class SearchService {
   constructor(
      @InjectModel(Track.name) private readonly trackModel: Model<TrackDocument>,
      @InjectModel(Artist.name) private readonly artistModel: Model<ArtistDocument>,
      @InjectModel(Album.name) private readonly albumModel: Model<AlbumDocument>,
      @InjectModel(Playlist.name)
      private readonly playlistModel: Model<PlaylistDocument>
   ) {}

   async search(q: string, type: SearchType = 'all', language?: string, genre?: string) {
      const result: Record<string, unknown[]> = {
         tracks: [],
         artists: [],
         albums: [],
         playlists: [],
      };
      if (!q || !q.trim()) return result;

      const rx = new RegExp(q.trim(), 'i');
      const wantAll = type === 'all';

      if (wantAll || type === 'tracks') {
         // ищем треки по названию ИЛИ по имени исполнителя
         const matchedArtists = await this.artistModel.find({ name: rx }).select('_id');
         const artistIds = matchedArtists.map((a) => a._id);
         const trackFilter: Record<string, unknown> = {
            $or: [{ name: rx }, { artistId: { $in: artistIds } }],
         };
         if (language) trackFilter.language = language;
         if (genre) trackFilter.genres = genre;
         result.tracks = await this.trackModel.find(trackFilter).limit(30).populate('artistId', 'name avatar');
      }
      if (wantAll || type === 'artists') {
         result.artists = await this.artistModel.find({ name: rx }).limit(20);
      }
      if (wantAll || type === 'albums') {
         result.albums = await this.albumModel.find({ title: rx }).limit(20).populate('artistId', 'name avatar');
      }
      if (wantAll || type === 'playlists') {
         result.playlists = await this.playlistModel.find({ title: rx, isPublic: true }).limit(20);
      }
      return result;
   }
}
