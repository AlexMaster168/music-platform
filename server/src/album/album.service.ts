import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Album, AlbumDocument } from './schemas/album.schema';
import { Track, TrackDocument } from '../track/schemas/track.schema';
import { CreateAlbumDto } from './dto/create-album.dto';

@Injectable()
export class AlbumService {
   constructor(
      @InjectModel(Album.name) private readonly albumModel: Model<AlbumDocument>,
      @InjectModel(Track.name) private readonly trackModel: Model<TrackDocument>
   ) {}

   create(dto: CreateAlbumDto) {
      return this.albumModel.create(dto);
   }

   getAll(count = 20, offset = 0) {
      return this.albumModel
         .find()
         .sort({ releaseDate: -1 })
         .skip(Number(offset))
         .limit(Number(count))
         .populate('artistId', 'name avatar');
   }

   /** Находит альбом по названию у артиста или создаёт — используется при загрузке трека. */
   async findOrCreateByTitle(title: string, artistId: Types.ObjectId, language?: string): Promise<AlbumDocument> {
      const trimmed = title.trim();
      const existing = await this.albumModel.findOne({ title: trimmed, artistId });
      if (existing) return existing;
      return this.albumModel.create({ title: trimmed, artistId, language });
   }

   async getOne(id: string) {
      const album = await this.albumModel.findById(id).populate('artistId', 'name avatar');
      if (!album) throw new NotFoundException('Альбом не найден');
      const tracks = await this.trackModel.find({ albumId: id }).populate('artistId', 'name avatar');
      return { album, tracks };
   }
}
