import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('home')
@Controller('home')
export class HomeController {
   constructor(private readonly homeService: HomeService) {}

   @UseGuards(OptionalJwtAuthGuard)
   @Get()
   feed(@CurrentUser('userId') userId?: string) {
      return this.homeService.feed(userId);
   }
}
