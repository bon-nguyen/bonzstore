import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export type CashbookVoucherType = 'INCOME' | 'EXPENSE';

export class CashbookQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  override limit?: number = 10;

  @IsOptional()
  @IsIn([
    'transactionDate',
    'voucherCode',
    'category',
    'totalAmount',
    'cashAmount',
    'cardAmount',
    'transferAmount',
  ])
  override sortBy?: string = 'transactionDate';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  override sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsIn(['ALL', 'INCOME', 'EXPENSE'])
  type?: 'ALL' | CashbookVoucherType;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['ALL', 'CASH', 'CARD', 'TRANSFER'])
  paymentChannel?: 'ALL' | 'CASH' | 'CARD' | 'TRANSFER';

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  importOrderId?: string;
}

export class CreateCashbookVoucherDto {
  @IsIn(['INCOME', 'EXPENSE'])
  type!: CashbookVoucherType;

  @IsOptional()
  @IsString()
  voucherCode?: string;

  @IsOptional()
  @IsString()
  transactionDate?: string;

  @IsString()
  category!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cashAmount?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cardAmount?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  transferAmount?: number = 0;

  @IsString()
  partnerName!: string; // Người nhận (chi) hoặc Người nộp (thu)

  @IsOptional()
  @IsString()
  staffName?: string; // Người thu / chi

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  importOrderId?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateCashbookVoucherDto {
  @IsOptional()
  @IsIn(['INCOME', 'EXPENSE'])
  type?: CashbookVoucherType;

  @IsOptional()
  @IsString()
  voucherCode?: string;

  @IsOptional()
  @IsString()
  transactionDate?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cashAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cardAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  transferAmount?: number;

  @IsOptional()
  @IsString()
  partnerName?: string;

  @IsOptional()
  @IsString()
  staffName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  importOrderId?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateOpeningBalanceDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cash!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  card!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  transfer!: number;
}

