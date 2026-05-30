import { IsMongoId, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
   @ApiProperty()
   @IsMongoId()
   trackId: string;

   @ApiProperty({ example: 'Огонь трек!' })
   @IsString()
   @MinLength(1)
   text: string;
}
