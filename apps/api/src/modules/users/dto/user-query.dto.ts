import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class UserQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  override limit?: number = 20;

  @IsOptional()
  @IsIn(['role', 'status', 'createdAt', 'fullName', 'email'])
  override sortBy?: 'role' | 'status' | 'createdAt' | 'fullName' | 'email' =
    'role';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  override sortOrder?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'LOCKED'])
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';

  @IsOptional()
  @IsString()
  roleCode?: string;
}
