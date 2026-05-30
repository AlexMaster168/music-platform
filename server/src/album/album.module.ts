import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
import { Album, AlbumSchema } from './schemas/album.schema';
import { Track, TrackSchema } from '../track/schemas/track.schema';

@Module({
   imports: [
      MongooseModule.forFeature([
         { name: Album.name, schema: AlbumSchema },
         { name: Track.name, schema: TrackSchema },
      ]),
   ],
   providers: [AlbumService],
   controllers: [AlbumController],
   exports: [AlbumService],
})
export class AlbumModule {}
