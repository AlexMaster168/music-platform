import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService, SearchType } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
   constructor(private readonly searchService: SearchService) {}

   @Get()
   search(
      @Query('q') q: string,
      @Query('type') type?: SearchType,
      @Query('language') language?: string,
      @Query('genre') genre?: string
   ) {
      return this.searchService.search(q, type ?? 'all', language, genre);
   }
}
