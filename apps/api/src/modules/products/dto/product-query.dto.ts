import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ProductQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['DRAFT', 'ACTIVE', 'INACTIVE', 'FREEZE'])
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'FREEZE';

  @IsOptional()
  @IsIn(['LOCAL', 'TIKTOK_SHOP', 'SHOPEE'])
  sourcePlatform?: 'LOCAL' | 'TIKTOK_SHOP' | 'SHOPEE';

  @IsOptional()
  @IsString()
  categoryId?: string;
}

