import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class ArticleQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  featured?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsIn(['newest', 'oldest'])
  sort?: string;

  @IsOptional()
  @IsIn(['true', 'false', 'all'])
  published?: string;
}