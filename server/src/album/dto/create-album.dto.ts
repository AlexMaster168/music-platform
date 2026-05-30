import { IsArray, IsDateString, IsIn, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ALBUM_TYPES, AlbumType } from '../schemas/album.schema';

export class CreateAlbumDto {
   @ApiProperty({ example: 'Night Visions' })
   @IsString()
   @MinLength(1)
   title: string;

   @ApiProperty({ example: '507f1f77bcf86cd799439011' })
   @IsMongoId()
   artistId: string;

   @ApiPropertyOptional()
   @IsOptional()
   @IsString()
   cover?: string;

   @ApiPropertyOptional()
   @IsOptional()
   @IsDateString()
   releaseDate?: string;

   @ApiPropertyOptional({ enum: ALBUM_TYPES })
   @IsOptional()
   @IsIn(ALBUM_TYPES)
   type?: AlbumType;

   @ApiPropertyOptional()
   @IsOptional()
   @IsString()
   language?: string;

   @ApiPropertyOptional({ type: [String] })
   @IsOptional()
   @IsArray()
   @IsString({ each: true })
   genres?: string[];
}
