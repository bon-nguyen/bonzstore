import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'WAREHOUSE_STAFF' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Nhân viên kho' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Quản lý xuất nhập tồn kho' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAdminPanel?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['dashboard.view', 'products.read'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionCodes?: string[];
}

