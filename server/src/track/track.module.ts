import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { Track, TrackSchema } from './schemas/track.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { ListenHistory, ListenHistorySchema } from './schemas/listen-history.schema';
import { FileModule } from '../file/file.module';
import { ArtistModule } from '../artist/artist.module';
import { AlbumModule } from '../album/album.module';
import { UserModule } from '../user/user.module';

@Module({
   imports: [
      MongooseModule.forFeature([
         { name: Track.name, schema: TrackSchema },
         { name: Comment.name, schema: CommentSchema },
         { name: ListenHistory.name, schema: ListenHistorySchema },
      ]),
      FileModule,
      ArtistModule,
      AlbumModule,
      UserModule,
   ],
   controllers: [TrackController],
   providers: [TrackService],
   exports: [TrackService, MongooseModule],
})
export class TrackModule {}
