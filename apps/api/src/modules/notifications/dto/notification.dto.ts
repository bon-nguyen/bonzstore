import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export type NotificationAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type NotificationModuleType =
  | 'PRODUCTS'
  | 'CATEGORIES'
  | 'TAGS'
  | 'USERS'
  | 'ROLES';

export class NotificationQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  override limit?: number = 10;

  @IsOptional()
  @IsIn(['createdAt', 'module', 'action'])
  override sortBy?: 'createdAt' | 'module' | 'action' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  override sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsIn(['ALL', 'PRODUCTS', 'CATEGORIES', 'TAGS', 'USERS', 'ROLES'])
  module?: 'ALL' | NotificationModuleType;

  @IsOptional()
  @IsIn(['ALL', 'CREATE', 'UPDATE', 'DELETE'])
  action?: 'ALL' | NotificationAction;

  @IsOptional()
  @IsIn(['ALL', 'UNREAD', 'READ'])
  readStatus?: 'ALL' | 'UNREAD' | 'READ';
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  masterEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  showToastOnEvent?: boolean;

  @IsOptional()
  @IsBoolean()
  onlyAdminActions?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  retentionDays?: number;

  @IsOptional()
  @IsObject()
  modules?: Partial<
    Record<
      NotificationModuleType,
      Partial<Record<NotificationAction, boolean>>
    >
  >;
}

export class MarkNotificationReadDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

export class CreateTestNotificationDto {
  @IsOptional()
  @IsIn(['PRODUCTS', 'CATEGORIES', 'TAGS', 'USERS', 'ROLES'])
  module?: NotificationModuleType;

  @IsOptional()
  @IsIn(['CREATE', 'UPDATE', 'DELETE'])
  action?: NotificationAction;

  @IsOptional()
  @IsString()
  customTargetName?: string;
}

