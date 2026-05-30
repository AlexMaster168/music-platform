import { IsBooleanString, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrackDto {
   @ApiProperty({ example: 'Believer' })
   @IsString()
   @MinLength(1)
   name: string;

   @ApiProperty({ example: 'Imagine Dragons', description: 'Имя артиста (создаётся при отсутствии)' })
   @IsString()
   @MinLength(1)
   artist: string;

   @ApiPropertyOptional({ description: 'Название альбома (создаётся при отсутствии)' })
   @IsOptional()
   @IsString()
   album?: string;

   @ApiPropertyOptional({ description: 'Текст песни' })
   @IsOptional()
   @IsString()
   lyrics?: string;

   @ApiPropertyOptional({ example: 'en', description: 'Язык трека (ISO-код)' })
   @IsOptional()
   @IsString()
   language?: string;

   @ApiPropertyOptional({ description: 'Жанры через запятую или массив', example: 'rock,pop' })
   @IsOptional()
   genres?: string | string[];

   @ApiPropertyOptional({ description: 'Это кавер?', example: 'false' })
   @IsOptional()
   @IsBooleanString()
   isCover?: string;

   @ApiPropertyOptional({ description: 'ID оригинального трека (для каверов)' })
   @IsOptional()
   @IsMongoId()
   originalTrackId?: string;

   @ApiPropertyOptional({ description: 'Длительность в секундах' })
   @IsOptional()
   duration?: number;
}
