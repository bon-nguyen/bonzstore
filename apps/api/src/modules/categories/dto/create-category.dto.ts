import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Áo Khoác Anime' })
  @IsString()
  @IsNotEmpty()
  localName!: string;

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

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Manga, Light Novel & Artbook' })
  @IsOptional()
  @IsString()
  localName?: string;

  @ApiPropertyOptional({ example: '607001' })
  @IsOptional()
  @IsString()
  externalCategoryId?: string;

  @ApiPropertyOptional({
    description: 'UUID của danh mục cha nội bộ (truyền chuỗi rỗng hoặc null nếu là danh mục gốc)',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLeaf?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryVersion?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionStatuses?: string[];

  @ApiPropertyOptional({ enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
