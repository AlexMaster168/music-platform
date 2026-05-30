import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
   constructor(private readonly users: UserService) {}

   @Get('me/library')
   library(@CurrentUser('userId') userId: string) {
      return this.users.getLibrary(userId);
   }

   @Get('me/likes')
   likes(@CurrentUser('userId') userId: string) {
      return this.users.getLikedTracks(userId);
   }

   @Post('me/likes/:trackId')
   like(@CurrentUser('userId') userId: string, @Param('trackId') trackId: string) {
      return this.users.likeTrack(userId, trackId);
   }

   @Delete('me/likes/:trackId')
   unlike(@CurrentUser('userId') userId: string, @Param('trackId') trackId: string) {
      return this.users.unlikeTrack(userId, trackId);
   }

   @Get('me/following')
   following(@CurrentUser('userId') userId: string) {
      return this.users.getFollowingArtists(userId);
   }

   @Post('me/following/:artistId')
   follow(@CurrentUser('userId') userId: string, @Param('artistId') artistId: string) {
      return this.users.followArtist(userId, artistId);
   }

   @Delete('me/following/:artistId')
   unfollow(@CurrentUser('userId') userId: string, @Param('artistId') artistId: string) {
      return this.users.unfollowArtist(userId, artistId);
   }
}
