import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { Artist, ArtistSchema } from '../artist/schemas/artist.schema';

@Module({
   imports: [
      MongooseModule.forFeature([
         { name: User.name, schema: UserSchema },
         { name: Artist.name, schema: ArtistSchema },
      ]),
   ],
   providers: [UserService],
   controllers: [UserController],
   exports: [UserService],
})
export class UserModule {}
