import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Áo Khoác Nam' })
  @IsString()
  @IsNotEmpty()
  localName: string;

  @ApiPropertyOptional({ example: '600088' })
  @IsOptional()
  @IsString()
  externalCategoryId?: string;

  @ApiPropertyOptional({ description: 'UUID của danh mục cha nội bộ' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isLeaf?: boolean;

  @ApiPropertyOptional({ default: 'v2' })
  @IsOptional()
  @IsString()
  categoryVersion?: string;

  @ApiPropertyOptional({ type: [String], default: ['AVAILABLE'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionStatuses?: string[];
}

