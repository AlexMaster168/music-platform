import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Track, TrackDocument } from './schemas/track.schema';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { ListenHistory, ListenHistoryDocument } from './schemas/listen-history.schema';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FileService, FileType } from '../file/file.service';
import { ArtistService } from '../artist/artist.service';
import { AlbumService } from '../album/album.service';
import { UserService } from '../user/user.service';
import { AuthUser } from '../common/decorators/current-user.decorator';

interface TrackFilters {
   language?: string;
   genre?: string;
   search?: string;
   artistId?: string;
}

type UploadedFile = { originalname: string; buffer: Buffer };

@Injectable()
export class TrackService {
   constructor(
      @InjectModel(Track.name) private readonly trackModel: Model<TrackDocument>,
      @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
      @InjectModel(ListenHistory.name)
      private readonly historyModel: Model<ListenHistoryDocument>,
      private readonly fileService: FileService,
      private readonly artistService: ArtistService,
      private readonly albumService: AlbumService,
      private readonly userService: UserService
   ) {}

   async create(dto: CreateTrackDto, picture: UploadedFile | undefined, audio: UploadedFile, userId?: string) {
      const audioPath = this.fileService.createFile(FileType.AUDIO, audio);
      const picturePath = picture ? this.fileService.createFile(FileType.IMAGE, picture) : undefined;

      const artist = await this.artistService.findOrCreateByName(dto.artist, dto.language);
      let albumId: Types.ObjectId | undefined;
      if (dto.album) {
         const album = await this.albumService.findOrCreateByTitle(dto.album, artist._id, dto.language);
         albumId = album._id;
      }

      const track = await this.trackModel.create({
         name: dto.name,
         artistId: artist._id,
         albumId,
         audio: audioPath,
         picture: picturePath,
         duration: Number(dto.duration) || 0,
         listens: 0,
         genres: this.parseList(dto.genres),
         language: dto.language,
         isCover: dto.isCover === 'true',
         originalTrackId: dto.originalTrackId ? new Types.ObjectId(dto.originalTrackId) : undefined,
         lyrics: dto.lyrics,
         uploadedBy: userId ? new Types.ObjectId(userId) : undefined,
      });

      return track.populate('artistId', 'name avatar');
   }

   async getAll(count = 20, offset = 0, filters: TrackFilters = {}) {
      const query: Record<string, unknown> = {};
      if (filters.language) query.language = filters.language;
      if (filters.genre) query.genres = filters.genre;
      if (filters.artistId) query.artistId = new Types.ObjectId(filters.artistId);
      if (filters.search) query.name = { $regex: new RegExp(filters.search, 'i') };

      return this.trackModel
         .find(query)
         .sort({ createdAt: -1 })
         .skip(Number(offset))
         .limit(Number(count))
         .populate('artistId', 'name avatar')
         .populate('albumId', 'title cover');
   }

   async getOne(id: string, userId?: string) {
      const track = await this.trackModel
         .findById(id)
         .populate('artistId', 'name avatar')
         .populate('albumId', 'title cover')
         .populate({
            path: 'comments',
            populate: { path: 'userId', select: 'displayName avatar' },
         })
         .populate({ path: 'originalTrackId', select: 'name artistId' });
      if (!track) throw new NotFoundException('Трек не найден');

      const [covers, likedIds] = await Promise.all([
         this.trackModel.find({ originalTrackId: id }).populate('artistId', 'name avatar'),
         this.userService.getLikedTrackIds(userId),
      ]);

      return {
         ...track.toJSON(),
         isLiked: likedIds.has(track._id.toString()),
         covers,
      };
   }

   async similar(id: string) {
      const track = await this.trackModel.findById(id);
      if (!track) throw new NotFoundException('Трек не найден');
      return this.trackModel
         .find({
            _id: { $ne: track._id },
            $or: [
               { artistId: track.artistId },
               { genres: { $in: track.genres } },
               ...(track.language ? [{ language: track.language }] : []),
            ],
         })
         .limit(20)
         .populate('artistId', 'name avatar');
   }

   /** Редактирование трека (админ): артист, альбом, жанры, язык и т.д. */
   async update(id: string, dto: UpdateTrackDto) {
      const track = await this.trackModel.findById(id);
      if (!track) throw new NotFoundException('Трек не найден');

      if (dto.name !== undefined) track.name = dto.name;
      if (dto.language !== undefined) track.language = dto.language;
      if (dto.genres !== undefined) track.genres = dto.genres;
      if (dto.lyrics !== undefined) track.lyrics = dto.lyrics;
      if (dto.isCover !== undefined) track.isCover = dto.isCover;
      if (dto.originalTrackId !== undefined) {
         track.originalTrackId = dto.originalTrackId ? new Types.ObjectId(dto.originalTrackId) : undefined;
      }

      // Смена исполнителя: по id или по имени (создаём при отсутствии)
      if (dto.artistId) {
         track.artistId = new Types.ObjectId(dto.artistId);
      } else if (dto.artist) {
         const artist = await this.artistService.findOrCreateByName(dto.artist, dto.language ?? track.language);
         track.artistId = artist._id;
      }

      // Альбом: по id, по названию (создаём), или убрать из альбома (пустая строка)
      if (dto.albumId) {
         track.albumId = new Types.ObjectId(dto.albumId);
      } else if (dto.album !== undefined) {
         if (dto.album) {
            const album = await this.albumService.findOrCreateByTitle(
               dto.album,
               track.artistId,
               dto.language ?? track.language
            );
            track.albumId = album._id;
         } else {
            track.albumId = undefined;
         }
      }

      await track.save();
      return track.populate('artistId', 'name avatar');
   }

   async delete(id: string, user: AuthUser) {
      const track = await this.trackModel.findById(id);
      if (!track) throw new NotFoundException('Трек не найден');
      const isOwner = !!track.uploadedBy && track.uploadedBy.toString() === user.userId;
      if (user.role !== 'admin' && !isOwner) {
         throw new ForbiddenException('Удалять можно только свои треки');
      }
      this.fileService.removeFile(track.audio);
      this.fileService.removeFile(track.picture);
      await this.commentModel.deleteMany({ trackId: id });
      await this.trackModel.findByIdAndDelete(id);
      return { _id: id };
   }

   async addComment(dto: CreateCommentDto, user: AuthUser) {
      const track = await this.trackModel.findById(dto.trackId);
      if (!track) throw new NotFoundException('Трек не найден');
      const comment = await this.commentModel.create({
         text: dto.text,
         trackId: new Types.ObjectId(dto.trackId),
         username: user.displayName,
         userId: new Types.ObjectId(user.userId),
      });
      track.comments.push(comment._id);
      await track.save();
      return comment;
   }

   async listen(id: string, userId?: string) {
      const res = await this.trackModel.updateOne({ _id: id }, { $inc: { listens: 1 } });
      if (res.matchedCount === 0) throw new NotFoundException('Трек не найден');
      if (userId) {
         await this.historyModel.create({
            userId: new Types.ObjectId(userId),
            trackId: new Types.ObjectId(id),
         });
      }
      return { ok: true };
   }

   private parseList(value?: string | string[]): string[] {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return value
         .split(',')
         .map((item) => item.trim())
         .filter(Boolean);
   }
}
