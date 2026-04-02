export type Category = {
  _id: string;
  name: string;
  color: string;
  orderIndex: number;
};

export type ArticleBlock = {
  type: string;
  content: string;
  contentNew?: string;
};

export type Article = {
  _id: string;
  title: string;
  lang?: string;
  lang_stat?: string;
  date?: string;
  featured?: boolean;
  published?: boolean;
  isReport?: boolean;
  thumbnail?: string;
  thumbnailNew?: string;
  category?: {
    _id: string;
    name: string;
    color: string;
    orderIndex: number;
  };
  author?: {
    name?: string;
    username?: string;
    fullName?: string;
    displayName?: string;
  };
  blocks?: ArticleBlock[];
};

export type ArticlesResponse = {
  data: Article[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters?: {
    category?: string | null;
    author?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
    published?: string | null;
    sort?: string | null;
  };
};

export type SearchResponse = {
  data: Article[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  query?: string;
};