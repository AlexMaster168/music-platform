import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistController {
   constructor(private readonly playlistService: PlaylistService) {}

   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @Get('me')
   getMine(@CurrentUser('userId') userId: string) {
      return this.playlistService.getMine(userId);
   }

   @Get(':id')
   getOne(@Param('id') id: string) {
      return this.playlistService.getOne(id);
   }

   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @Post()
   create(@Body() dto: CreatePlaylistDto, @CurrentUser('userId') userId: string) {
      return this.playlistService.create(dto, userId);
   }

   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @Patch(':id')
   update(@Param('id') id: string, @Body() dto: UpdatePlaylistDto, @CurrentUser('userId') userId: string) {
      return this.playlistService.update(id, userId, dto);
   }

   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @Delete(':id')
   delete(@Param('id') id: string, @CurrentUser('userId') userId: string) {
      return this.playlistService.delete(id, userId);
   }

   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @Post(':id/tracks/:trackId')
   addTrack(@Param('id') id: string, @Param('trackId') trackId: string, @CurrentUser('userId') userId: string) {
      return this.playlistService.addTrack(id, userId, trackId);
   }

   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @Delete(':id/tracks/:trackId')
   removeTrack(@Param('id') id: string, @Param('trackId') trackId: string, @CurrentUser('userId') userId: string) {
      return this.playlistService.removeTrack(id, userId, trackId);
   }
}
