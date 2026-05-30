import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
   constructor(
      private readonly auth: AuthService,
      private readonly users: UserService
   ) {}

   @Post('register')
   register(@Body() dto: RegisterDto) {
      return this.auth.register(dto);
   }

   @Post('login')
   login(@Body() dto: LoginDto) {
      return this.auth.login(dto);
   }

   @Post('refresh')
   refresh(@Body() dto: RefreshDto) {
      return this.auth.refresh(dto.refreshToken);
   }

   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @Get('me')
   me(@CurrentUser('userId') userId: string) {
      return this.users.findById(userId);
   }
}
