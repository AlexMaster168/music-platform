import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { Playlist, PlaylistSchema } from './schemas/playlist.schema';

@Module({
   imports: [MongooseModule.forFeature([{ name: Playlist.name, schema: PlaylistSchema }])],
   providers: [PlaylistService],
   controllers: [PlaylistController],
   exports: [PlaylistService],
})
export class PlaylistModule {}
