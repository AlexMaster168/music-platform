import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
   @ApiProperty({ example: 'user@example.com' })
   @IsEmail()
   email: string;

   @ApiProperty({ example: 'secret123', minLength: 6 })
   @IsString()
   @MinLength(6)
   @MaxLength(100)
   password: string;

   @ApiProperty({ example: 'Лёха' })
   @IsString()
   @MinLength(1)
   @MaxLength(60)
   displayName: string;
}
