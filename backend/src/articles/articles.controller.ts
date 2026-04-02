import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticleQueryDto } from './dto/article-query.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query: ArticleQueryDto) {
    return this.articlesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async search(@Query() query: ArticleQueryDto) {
    return this.articlesService.search(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.articlesService.findById(id);
  }
}