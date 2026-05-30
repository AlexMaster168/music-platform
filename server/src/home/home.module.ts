import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { Track, TrackSchema } from '../track/schemas/track.schema';
import { Album, AlbumSchema } from '../album/schemas/album.schema';
import { ListenHistory, ListenHistorySchema } from '../track/schemas/listen-history.schema';

@Module({
   imports: [
      MongooseModule.forFeature([
         { name: Track.name, schema: TrackSchema },
         { name: Album.name, schema: AlbumSchema },
         { name: ListenHistory.name, schema: ListenHistorySchema },
      ]),
   ],
   providers: [HomeService],
   controllers: [HomeController],
})
export class HomeModule {}
