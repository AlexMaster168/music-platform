import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { Artist, ArtistSchema } from './schemas/artist.schema';
import { Track, TrackSchema } from '../track/schemas/track.schema';
import { Album, AlbumSchema } from '../album/schemas/album.schema';

@Module({
   imports: [
      MongooseModule.forFeature([
         { name: Artist.name, schema: ArtistSchema },
         { name: Track.name, schema: TrackSchema },
         { name: Album.name, schema: AlbumSchema },
      ]),
   ],
   providers: [ArtistService],
   controllers: [ArtistController],
   exports: [ArtistService],
})
export class ArtistModule {}
