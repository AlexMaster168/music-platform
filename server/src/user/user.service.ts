import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Artist, ArtistDocument } from '../artist/schemas/artist.schema';

interface CreateUserData {
   email: string;
   passwordHash: string;
   displayName: string;
}

@Injectable()
export class UserService {
   constructor(
      @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
      @InjectModel(Artist.name) private readonly artistModel: Model<ArtistDocument>
   ) {}

   create(data: CreateUserData) {
      return this.userModel.create(data);
   }

   findByEmail(email: string) {
      return this.userModel.findOne({ email: email.toLowerCase() });
   }

   async findById(id: string) {
      const user = await this.userModel.findById(id);
      if (!user) throw new NotFoundException('Пользователь не найден');
      return user;
   }

   // ===== Лайки =====
   async likeTrack(userId: string, trackId: string) {
      await this.userModel.updateOne({ _id: userId }, { $addToSet: { likedTracks: new Types.ObjectId(trackId) } });
      return { trackId, liked: true };
   }

   async unlikeTrack(userId: string, trackId: string) {
      await this.userModel.updateOne({ _id: userId }, { $pull: { likedTracks: new Types.ObjectId(trackId) } });
      return { trackId, liked: false };
   }

   async getLikedTracks(userId: string) {
      const user = await this.userModel.findById(userId).populate({
         path: 'likedTracks',
         populate: { path: 'artistId', select: 'name avatar' },
      });
      // последние лайкнутые — сверху
      return (user?.likedTracks ?? []).slice().reverse();
   }

   async getLikedTrackIds(userId?: string): Promise<Set<string>> {
      if (!userId) return new Set();
      const user = await this.userModel.findById(userId).select('likedTracks');
      return new Set((user?.likedTracks ?? []).map((id) => id.toString()));
   }

   // ===== Подписки на артистов =====
   async followArtist(userId: string, artistId: string) {
      const res = await this.userModel.updateOne(
         { _id: userId },
         { $addToSet: { followingArtists: new Types.ObjectId(artistId) } }
      );
      if (res.modifiedCount === 1) {
         await this.artistModel.updateOne({ _id: artistId }, { $inc: { followersCount: 1 } });
      }
      return { artistId, following: true };
   }

   async unfollowArtist(userId: string, artistId: string) {
      const res = await this.userModel.updateOne(
         { _id: userId },
         { $pull: { followingArtists: new Types.ObjectId(artistId) } }
      );
      if (res.modifiedCount === 1) {
         await this.artistModel.updateOne(
            { _id: artistId, followersCount: { $gt: 0 } },
            { $inc: { followersCount: -1 } }
         );
      }
      return { artistId, following: false };
   }

   async getFollowingArtists(userId: string) {
      const user = await this.userModel.findById(userId).populate({ path: 'followingArtists' });
      return user?.followingArtists ?? [];
   }

   async getFollowingArtistIds(userId?: string): Promise<Set<string>> {
      if (!userId) return new Set();
      const user = await this.userModel.findById(userId).select('followingArtists');
      return new Set((user?.followingArtists ?? []).map((id) => id.toString()));
   }

   async getLibrary(userId: string) {
      const [likedTracks, followingArtists] = await Promise.all([
         this.getLikedTracks(userId),
         this.getFollowingArtists(userId),
      ]);
      return { likedTracks, followingArtists };
   }
}
