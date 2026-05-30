import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artist, ArtistDocument } from './schemas/artist.schema';
import { Track, TrackDocument } from '../track/schemas/track.schema';
import { Album, AlbumDocument } from '../album/schemas/album.schema';
import { CreateArtistDto } from './dto/create-artist.dto';

@Injectable()
export class ArtistService {
   constructor(
      @InjectModel(Artist.name) private readonly artistModel: Model<ArtistDocument>,
      @InjectModel(Track.name) private readonly trackModel: Model<TrackDocument>,
      @InjectModel(Album.name) private readonly albumModel: Model<AlbumDocument>
   ) {}

   create(dto: CreateArtistDto) {
      return this.artistModel.create(dto);
   }

   getAll(count = 20, offset = 0) {
      return this.artistModel.find().sort({ followersCount: -1 }).skip(Number(offset)).limit(Number(count));
   }

   /** Находит артиста по имени или создаёт нового — используется при загрузке трека. */
   async findOrCreateByName(name: string, language?: string): Promise<ArtistDocument> {
      const trimmed = name.trim();
      const existing = await this.artistModel.findOne({ name: trimmed });
      if (existing) return existing;
      return this.artistModel.create({
         name: trimmed,
         languages: language ? [language] : [],
      });
   }

   async getOne(id: string) {
      const artist = await this.artistModel.findById(id);
      if (!artist) throw new NotFoundException('Артист не найден');
      const [tracks, albums] = await Promise.all([
         this.trackModel.find({ artistId: id }).sort({ listens: -1 }).limit(50).populate('artistId', 'name avatar'),
         this.albumModel.find({ artistId: id }).sort({ releaseDate: -1 }),
      ]);
      return { artist, tracks, albums };
   }
}
