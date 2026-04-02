import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';
import { ArticleQueryDto } from './dto/article-query.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name)
    private readonly articleModel: Model<ArticleDocument>,
  ) {}

  async findAll(query: ArticleQueryDto) {
    const page = this.parsePositiveNumber(query.page, 1);
    const limit = this.parsePositiveNumber(query.limit, 10);
    const skip = (page - 1) * limit;

    const filter = this.buildListFilter(query);
    const sortDirection = query.sort === 'oldest' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .sort({ date: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.articleModel.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        category: query.category || null,
        author: query.author || null,
        dateFrom: query.dateFrom || null,
        dateTo: query.dateTo || null,
        published: query.published || 'true',
        sort: query.sort || 'newest',
      },
    };
  }

  async search(query: ArticleQueryDto) {
    const q = (query.search || '').trim();
    const page = this.parsePositiveNumber(query.page, 1);
    const limit = this.parsePositiveNumber(query.limit, 10);
    const skip = (page - 1) * limit;

    if (!q) {
      return {
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
        query: q,
      };
    }

    const matchStage = this.buildSearchMatch(query, q);

    const pipeline: PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
        $addFields: {
          titleMatched: {
            $cond: [
              {
                $regexMatch: {
                  input: { $ifNull: ['$title', ''] },
                  regex: q,
                  options: 'i',
                },
              },
              1,
              0,
            ],
          },
          matchedTextBlocksCount: {
            $size: {
              $filter: {
                input: { $ifNull: ['$blocks', []] },
                as: 'block',
                cond: {
                  $and: [
                    { $eq: ['$$block.type', 'text'] },
                    {
                      $regexMatch: {
                        input: { $ifNull: ['$$block.content', ''] },
                        regex: q,
                        options: 'i',
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              { $multiply: ['$titleMatched', 5] },
              '$matchedTextBlocksCount',
            ],
          },
        },
      },
      {
        $sort: {
          relevanceScore: -1,
          date: -1,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          meta: [{ $count: 'total' }],
        },
      },
    ];

    const result = await this.articleModel.aggregate(pipeline);
    const data = result[0]?.data || [];
    const total = result[0]?.meta?.[0]?.total || 0;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      query: q,
    };
  }

  async findById(id: string) {
    const article = await this.articleModel.findById(id).lean();

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  private buildListFilter(query: ArticleQueryDto): Record<string, any> {
    const filter: Record<string, any> = {};

    this.applyPublishedFilter(filter, query.published);
    this.applyCategoryFilter(filter, query.category);
    this.applyFeaturedFilter(filter, query.featured);
    this.applyAuthorFilter(filter, query.author);
    this.applyDateFilter(filter, query.dateFrom, query.dateTo);
    this.applySearchFilter(filter, query.search);

    return filter;
  }

  private buildSearchMatch(
    query: ArticleQueryDto,
    searchText: string,
  ): Record<string, any> {
    const match: Record<string, any> = {};

    this.applyPublishedFilter(match, query.published);
    this.applyCategoryFilter(match, query.category);
    this.applyAuthorFilter(match, query.author);
    this.applyDateFilter(match, query.dateFrom, query.dateTo);

    match.$and = [
      ...(Array.isArray(match.$and) ? match.$and : []),
      {
        $or: [
          { title: { $regex: searchText, $options: 'i' } },
          { 'blocks.content': { $regex: searchText, $options: 'i' } },
        ],
      },
    ];

    return match;
  }

  private applyPublishedFilter(
    filter: Record<string, any>,
    published?: string,
  ) {
    if (!published || published === 'true') {
      filter.published = true;
      return;
    }

    if (published === 'false') {
      filter.published = false;
    }
  }

  private applyCategoryFilter(
    filter: Record<string, any>,
    category?: string,
  ) {
    if (category?.trim()) {
      filter['category.name'] = category.trim();
    }
  }

  private applyFeaturedFilter(
    filter: Record<string, any>,
    featured?: string,
  ) {
    if (featured === 'true') {
      filter.featured = true;
    } else if (featured === 'false') {
      filter.featured = false;
    }
  }

  private applyAuthorFilter(
    filter: Record<string, any>,
    author?: string,
  ) {
    if (!author?.trim()) {
      return;
    }

    const value = author.trim();

    filter.$and = [
      ...(Array.isArray(filter.$and) ? filter.$and : []),
      {
        $or: [
          { 'author.name': { $regex: value, $options: 'i' } },
          { 'author.fullName': { $regex: value, $options: 'i' } },
          { 'author.displayName': { $regex: value, $options: 'i' } },
          { 'author.username': { $regex: value, $options: 'i' } },
        ],
      },
    ];
  }

  private applyDateFilter(
    filter: Record<string, any>,
    dateFrom?: string,
    dateTo?: string,
  ) {
    if (!dateFrom && !dateTo) {
      return;
    }

    const dateFilter: Record<string, Date> = {};

    if (dateFrom) {
      dateFilter.$gte = new Date(dateFrom);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      dateFilter.$lte = to;
    }

    filter.date = dateFilter;
  }

  private applySearchFilter(
    filter: Record<string, any>,
    search?: string,
  ) {
    if (!search?.trim()) {
      return;
    }

    const value = search.trim();

    filter.$and = [
      ...(Array.isArray(filter.$and) ? filter.$and : []),
      {
        $or: [
          { title: { $regex: value, $options: 'i' } },
          { 'blocks.content': { $regex: value, $options: 'i' } },
        ],
      },
    ];
  }

  private parsePositiveNumber(value: string | undefined, fallback: number) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}