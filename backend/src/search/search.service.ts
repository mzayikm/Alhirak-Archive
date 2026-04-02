import { Injectable } from '@nestjs/common';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class SearchService {
  constructor(private readonly articlesService: ArticlesService) {}

  async search(q: string, page?: string, limit?: string, published?: string) {
    return this.articlesService.search({
      search: q,
      page,
      limit,
      published,
    });
  }
}