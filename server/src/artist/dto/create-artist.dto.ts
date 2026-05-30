import { IsArray, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArtistDto {
   @ApiProperty({ example: 'Imagine Dragons' })
   @IsString()
   @MinLength(1)
   @MaxLength(120)
   name: string;

   @ApiPropertyOptional()
   @IsOptional()
   @IsString()
   bio?: string;

   @ApiPropertyOptional()
   @IsOptional()
   @IsString()
   avatar?: string;

   @ApiPropertyOptional()
   @IsOptional()
   @IsString()
   banner?: string;

   @ApiPropertyOptional({ type: [String], example: ['rock', 'pop'] })
   @IsOptional()
   @IsArray()
   @IsString({ each: true })
   genres?: string[];

   @ApiPropertyOptional({ type: [String], example: ['en', 'ru'] })
   @IsOptional()
   @IsArray()
   @IsString({ each: true })
   languages?: string[];
}
