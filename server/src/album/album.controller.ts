import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AlbumService } from './album.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('albums')
@Controller('albums')
export class AlbumController {
   constructor(private readonly albumService: AlbumService) {}

   @Get()
   getAll(@Query('count') count?: number, @Query('offset') offset?: number) {
      return this.albumService.getAll(count, offset);
   }

   @Get(':id')
   getOne(@Param('id') id: string) {
      return this.albumService.getOne(id);
   }

   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @Post()
   create(@Body() dto: CreateAlbumDto) {
      return this.albumService.create(dto);
   }
}
