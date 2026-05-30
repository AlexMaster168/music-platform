import {
   Body,
   Controller,
   Delete,
   Get,
   Param,
   Patch,
   Post,
   Query,
   UploadedFiles,
   UseGuards,
   UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { TrackService } from './track.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('tracks')
@Controller('tracks')
export class TrackController {
   constructor(private readonly trackService: TrackService) {}

   @Get()
   getAll(
      @Query('count') count?: number,
      @Query('offset') offset?: number,
      @Query('language') language?: string,
      @Query('genre') genre?: string,
      @Query('search') search?: string,
      @Query('artistId') artistId?: string
   ) {
      return this.trackService.getAll(count, offset, {
         language,
         genre,
         search,
         artistId,
      });
   }

   @Get(':id/similar')
   similar(@Param('id') id: string) {
      return this.trackService.similar(id);
   }

   @UseGuards(OptionalJwtAuthGuard)
   @Get(':id')
   getOne(@Param('id') id: string, @CurrentUser('userId') userId?: string) {
      return this.trackService.getOne(id, userId);
   }

   @ApiBearerAuth()
   @ApiConsumes('multipart/form-data')
   @UseGuards(JwtAuthGuard)
   @Post()
   @UseInterceptors(
      FileFieldsInterceptor([
         { name: 'picture', maxCount: 1 },
         { name: 'audio', maxCount: 1 },
      ])
   )
   create(
      @UploadedFiles() files: { picture?: any[]; audio?: any[] },
      @Body() dto: CreateTrackDto,
      @CurrentUser('userId') userId: string
   ) {
      const audio = files.audio?.[0];
      const picture = files.picture?.[0];
      return this.trackService.create(dto, picture, audio, userId);
   }

   @ApiBearerAuth()
   @Roles('admin')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Patch(':id')
   update(@Param('id') id: string, @Body() dto: UpdateTrackDto) {
      return this.trackService.update(id, dto);
   }

   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @Delete(':id')
   delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
      return this.trackService.delete(id, user);
   }

   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @Post('comment')
   addComment(@Body() dto: CreateCommentDto, @CurrentUser() user: AuthUser) {
      return this.trackService.addComment(dto, user);
   }

   @UseGuards(OptionalJwtAuthGuard)
   @Post('listen/:id')
   listen(@Param('id') id: string, @CurrentUser('userId') userId?: string) {
      return this.trackService.listen(id, userId);
   }
}
