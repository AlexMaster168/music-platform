import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ArtistService } from './artist.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('artists')
@Controller('artists')
export class ArtistController {
   constructor(private readonly artistService: ArtistService) {}

   @Get()
   getAll(@Query('count') count?: number, @Query('offset') offset?: number) {
      return this.artistService.getAll(count, offset);
   }

   @Get(':id')
   getOne(@Param('id') id: string) {
      return this.artistService.getOne(id);
   }

   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @Post()
   create(@Body() dto: CreateArtistDto) {
      return this.artistService.create(dto);
   }
}
