import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Track, TrackSchema } from '../track/schemas/track.schema';
import { Artist, ArtistSchema } from '../artist/schemas/artist.schema';
import { Album, AlbumSchema } from '../album/schemas/album.schema';
import { Playlist, PlaylistSchema } from '../playlist/schemas/playlist.schema';

@Module({
   imports: [
      MongooseModule.forFeature([
         { name: Track.name, schema: TrackSchema },
         { name: Artist.name, schema: ArtistSchema },
         { name: Album.name, schema: AlbumSchema },
         { name: Playlist.name, schema: PlaylistSchema },
      ]),
   ],
   providers: [SearchService],
   controllers: [SearchController],
})
export class SearchModule {}
