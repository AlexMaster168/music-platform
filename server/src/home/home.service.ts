import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Track, TrackDocument } from '../track/schemas/track.schema';
import { Album, AlbumDocument } from '../album/schemas/album.schema';
import { ListenHistory, ListenHistoryDocument } from '../track/schemas/listen-history.schema';

@Injectable()
export class HomeService {
   constructor(
      @InjectModel(Track.name) private readonly trackModel: Model<TrackDocument>,
      @InjectModel(Album.name) private readonly albumModel: Model<AlbumDocument>,
      @InjectModel(ListenHistory.name)
      private readonly historyModel: Model<ListenHistoryDocument>
   ) {}

   async feed(userId?: string) {
      const [trending, fresh, covers, albums, languages, genres] = await Promise.all([
         this.trackModel.find().sort({ listens: -1 }).limit(12).populate('artistId', 'name avatar'),
         this.trackModel.find().sort({ createdAt: -1 }).limit(12).populate('artistId', 'name avatar'),
         this.trackModel
            .find({ isCover: true })
            .limit(12)
            .populate('artistId', 'name avatar')
            .populate('originalTrackId', 'name'),
         this.albumModel.find().sort({ releaseDate: -1, createdAt: -1 }).limit(12).populate('artistId', 'name avatar'),
         this.trackModel.distinct('language'),
         this.trackModel.distinct('genres'),
      ]);

      let history: unknown[] = [];
      if (userId) {
         const records = await this.historyModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(12)
            .populate({
               path: 'trackId',
               populate: { path: 'artistId', select: 'name avatar' },
            });
         // последние уникальные треки
         const seen = new Set<string>();
         history = records
            .map((r) => r.trackId as unknown as { _id?: { toString(): string } })
            .filter((t) => {
               if (!t || !t._id) return false;
               const id = t._id.toString();
               if (seen.has(id)) return false;
               seen.add(id);
               return true;
            });
      }

      return {
         trending,
         fresh,
         covers,
         albums,
         languages: (languages as (string | null)[]).filter(Boolean),
         genres: (genres as (string | null)[]).filter(Boolean),
         history,
      };
   }
}
