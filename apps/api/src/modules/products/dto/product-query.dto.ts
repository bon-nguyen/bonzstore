import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ProductTagQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  override limit?: number = 10;

  @IsOptional()
  @IsIn(['name', 'count'])
  override sortBy?: 'name' | 'count' = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  override sortOrder?: 'asc' | 'desc' = 'asc';
}

export type TikTokProductTabStatus =
  | 'ALL'
  | 'ACTIVE'
  | 'PENDING'
  | 'FAILED'
  | 'FREEZE'
  | 'INACTIVE'
  | 'DRAFT'
  | 'DELETED';

export class ProductQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn([
    'ALL',
    'ACTIVE',
    'PENDING',
    'FAILED',
    'FREEZE',
    'INACTIVE',
    'DRAFT',
    'DELETED',
  ])
  status?: TikTokProductTabStatus;

  @IsOptional()
  @IsIn(['LOCAL', 'TIKTOK_SHOP', 'SHOPEE'])
  sourcePlatform?: 'LOCAL' | 'TIKTOK_SHOP' | 'SHOPEE';

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  outOfStock?: string;

  @IsOptional()
  @IsIn(['all', 'in_stock', 'low_stock', 'out_of_stock'])
  stockState?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

  @IsOptional()
  @IsString()
  minPrice?: string;

  @IsOptional()
  @IsString()
  maxPrice?: string;

  @IsOptional()
  @IsString()
  hasDiscount?: string;
}
