import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Playlist, PlaylistDocument } from './schemas/playlist.schema';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Injectable()
export class PlaylistService {
   constructor(
      @InjectModel(Playlist.name)
      private readonly playlistModel: Model<PlaylistDocument>
   ) {}

   create(dto: CreatePlaylistDto, ownerId: string) {
      return this.playlistModel.create({
         ...dto,
         ownerId: new Types.ObjectId(ownerId),
      });
   }

   getMine(ownerId: string) {
      return this.playlistModel.find({ ownerId }).sort({ updatedAt: -1 });
   }

   async getOne(id: string) {
      const playlist = await this.playlistModel
         .findById(id)
         .populate('ownerId', 'displayName avatar')
         .populate({
            path: 'tracks',
            populate: { path: 'artistId', select: 'name avatar' },
         });
      if (!playlist) throw new NotFoundException('Плейлист не найден');
      return playlist;
   }

   private async getOwned(id: string, ownerId: string): Promise<PlaylistDocument> {
      const playlist = await this.playlistModel.findById(id);
      if (!playlist) throw new NotFoundException('Плейлист не найден');
      if (playlist.ownerId.toString() !== ownerId) {
         throw new ForbiddenException('Это не ваш плейлист');
      }
      return playlist;
   }

   async update(id: string, ownerId: string, dto: UpdatePlaylistDto) {
      const playlist = await this.getOwned(id, ownerId);
      Object.assign(playlist, dto);
      await playlist.save();
      return playlist;
   }

   async delete(id: string, ownerId: string) {
      await this.getOwned(id, ownerId);
      await this.playlistModel.findByIdAndDelete(id);
      return { _id: id };
   }

   async addTrack(id: string, ownerId: string, trackId: string) {
      const playlist = await this.getOwned(id, ownerId);
      await this.playlistModel.updateOne({ _id: playlist._id }, { $addToSet: { tracks: new Types.ObjectId(trackId) } });
      return { ok: true };
   }

   async removeTrack(id: string, ownerId: string, trackId: string) {
      const playlist = await this.getOwned(id, ownerId);
      await this.playlistModel.updateOne({ _id: playlist._id }, { $pull: { tracks: new Types.ObjectId(trackId) } });
      return { ok: true };
   }
}
