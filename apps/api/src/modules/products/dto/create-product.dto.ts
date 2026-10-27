import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Áo Thun Nam Cotton Compact 250gsm' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'UUID của Danh mục lá (isLeaf = true)' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ example: 'BonzMenswear' })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionHtml?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 'TSHIRT-BLK-L' })
  @IsString()
  @IsNotEmpty()
  sellerSku: string;

  @ApiProperty({ example: 250000 })
  @IsNumber()
  @Min(0)
  originalPrice: number;

  @ApiProperty({ example: 179000 })
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiPropertyOptional({ enum: ['LOCAL', 'TIKTOK_SHOP', 'SHOPEE'], default: 'LOCAL' })
  @IsOptional()
  @IsIn(['LOCAL', 'TIKTOK_SHOP', 'SHOPEE'])
  sourcePlatform?: 'LOCAL' | 'TIKTOK_SHOP' | 'SHOPEE';

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  salesAttributes?: Array<{ name: string; value_name: string }>;
}

export class ImportPlatformProductDto {
  @ApiProperty({ enum: ['TIKTOK_SHOP', 'SHOPEE'], example: 'TIKTOK_SHOP' })
  @IsIn(['TIKTOK_SHOP', 'SHOPEE'])
  platform: 'TIKTOK_SHOP' | 'SHOPEE';

  @ApiPropertyOptional({ example: 'VN-TTS-99881' })
  @IsOptional()
  @IsString()
  externalShopId?: string;
}

