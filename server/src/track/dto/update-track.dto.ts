import { IsArray, IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTrackDto {
   @ApiPropertyOptional()
   @IsOptional()
   @IsString()
   name?: string;

   @ApiPropertyOptional({ description: 'Имя артиста (создаётся при отсутствии)' })
   @IsOptional()
   @IsString()
   artist?: string;

   @ApiPropertyOptional({ description: 'ID существующего артиста' })
   @IsOptional()
   @IsMongoId()
   artistId?: string;

   @ApiPropertyOptional({ description: 'Название альбома; пустая строка — убрать из альбома' })
   @IsOptional()
   @IsString()
   album?: string;

   @ApiPropertyOptional({ description: 'ID существующего альбома' })
   @IsOptional()
   @IsMongoId()
   albumId?: string;

   @ApiPropertyOptional()
   @IsOptional()
   @IsString()
   language?: string;

   @ApiPropertyOptional({ type: [String] })
   @IsOptional()
   @IsArray()
   @IsString({ each: true })
   genres?: string[];

   @ApiPropertyOptional()
   @IsOptional()
   @IsString()
   lyrics?: string;

   @ApiPropertyOptional()
   @IsOptional()
   @IsBoolean()
   isCover?: boolean;

   @ApiPropertyOptional()
   @IsOptional()
   @IsMongoId()
   originalTrackId?: string;
}
