import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ImportOrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  override limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  PageIndex?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  PageSize?: number;

  @IsOptional()
  @IsString()
  OrderBy?: string = 'Id desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  UID?: number = 6176;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  OrderType?: number;

  @IsOptional()
  @IsIn(['CURRENT', 'DRAFT', 'APPROVED'])
  tab?: 'CURRENT' | 'DRAFT' | 'APPROVED';

  @IsOptional()
  @IsIn(['Created', 'Id', 'TotalPriceVND', 'OrderWeight', 'Status'])
  override sortBy?: string = 'Created';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  override sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  site?: string;
}

export class HoabinhLoginDto {
  @IsString()
  userName!: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  customToken?: string;
}

export class SaveImportTokenDto {
  @IsString()
  token!: string;

  @IsOptional()
  @IsString()
  accountUsername?: string;

  @IsOptional()
  @IsString()
  loginUrl?: string;

  @IsOptional()
  @IsString()
  apiBaseUrl?: string;
}

export class FetchExternalOrderDto {
  @IsOptional()
  @IsString()
  orderIdOrUrl?: string = '55479';

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  rawJson?: string;

  @IsOptional()
  @IsIn(['CURRENT', 'DRAFT', 'APPROVED'])
  targetTab?: 'CURRENT' | 'DRAFT' | 'APPROVED';

  @IsOptional()
  @IsBoolean()
  autoSyncProducts?: boolean = true;

  @IsOptional()
  @IsBoolean()
  autoSyncCashbook?: boolean = true;
}

export class SyncImportOrderCatalogDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  priceMarkupMultiplier?: number = 1.35;

  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class UpdateImportOrderDto {
  @IsOptional()
  @IsString()
  staffNote?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @IsOptional()
  @IsString()
  statusName?: string;
}
