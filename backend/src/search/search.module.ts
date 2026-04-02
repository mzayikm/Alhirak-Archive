import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Article, ArticleSchema } from '../articles/schemas/article.schema';
import { ArticlesService } from '../articles/articles.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
  ],
  controllers: [SearchController],
  providers: [SearchService, ArticlesService],
})
export class SearchModule {}