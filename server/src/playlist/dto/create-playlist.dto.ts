import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlaylistDto {
   @ApiProperty({ example: 'Моя подборка' })
   @IsString()
   @MinLength(1)
   @MaxLength(120)
   title: string;

   @ApiPropertyOptional()
   @IsOptional()
   @IsString()
   description?: string;

   @ApiPropertyOptional()
   @IsOptional()
   @IsString()
   cover?: string;

   @ApiPropertyOptional({ default: true })
   @IsOptional()
   @IsBoolean()
   isPublic?: boolean;
}
