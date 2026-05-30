import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { TrackModule } from './track/track.module';
import { FileModule } from './file/file.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ArtistModule } from './artist/artist.module';
import { AlbumModule } from './album/album.module';
import { PlaylistModule } from './playlist/playlist.module';
import { SearchModule } from './search/search.module';
import { HomeModule } from './home/home.module';

@Module({
   imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      ServeStaticModule.forRoot({
         rootPath: path.resolve(__dirname, 'static'),
         serveRoot: '/',
      }),
      MongooseModule.forRootAsync({
         inject: [ConfigService],
         useFactory: (config: ConfigService) => ({
            uri: config.get<string>('MONGO_URI'),
         }),
      }),
      AuthModule,
      UserModule,
      ArtistModule,
      AlbumModule,
      PlaylistModule,
      TrackModule,
      FileModule,
      SearchModule,
      HomeModule,
   ],
})
export class AppModule {}
