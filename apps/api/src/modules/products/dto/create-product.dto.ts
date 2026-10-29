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
  @ApiProperty({
    example:
      '[Bonzstore] Mô Hình Hunter x Hunter Bộ 8 Nhân Vật Thợ Săn Chibi Q Version Dáng Ngồi 9-10cm - Figure PVC HXH002',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'UUID của Danh mục lá (isLeaf = true)' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ example: 'Good Smile Company' })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionHtml?: string;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Danh sách URL ảnh sản phẩm (tối đa 9 ảnh 1:1)',
  })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({
    description: 'URL Video giới thiệu sản phẩm (MP4, MOV, MKV, AVI, tối đa 100MB)',
  })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ example: 'HXH002-SET8' })
  @IsOptional()
  @IsString()
  sellerSku?: string;

  @ApiPropertyOptional({ example: 299000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional({ example: 224250 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ example: 31 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({
    description:
      'Danh sách biến thể SKU từ bảng Thông tin bán hàng (#skus trong TikTok Shop Seller Center)',
  })
  @IsOptional()
  @IsArray()
  skus?: Array<{
    sellerSku: string;
    originalPrice: number;
    salePrice?: number;
    stockQuantity: number;
    imageUrl?: string;
    salesAttributes?: Array<{
      name: string;
      value_name: string;
      sku_img?: string;
    }>;
  }>;

  @ApiPropertyOptional({
    description: 'Thuộc tính sản phẩm (Series Anime, Chất liệu, Chiều cao, Xuất xứ...)',
  })
  @IsOptional()
  @IsArray()
  attributes?: Array<{ name: string; value: string }>;

  @ApiPropertyOptional({ example: 0.45, description: 'Trọng lượng gói hàng (kg)' })
  @IsOptional()
  @IsNumber()
  packageWeight?: number;

  @ApiPropertyOptional({
    enum: ['LOCAL', 'TIKTOK_SHOP', 'SHOPEE'],
    default: 'TIKTOK_SHOP',
  })
  @IsOptional()
  @IsIn(['LOCAL', 'TIKTOK_SHOP', 'SHOPEE'])
  sourcePlatform?: 'LOCAL' | 'TIKTOK_SHOP' | 'SHOPEE';

  @ApiPropertyOptional({
    enum: ['ACTIVE', 'PENDING', 'FAILED', 'INACTIVE', 'DRAFT'],
    default: 'ACTIVE',
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'PENDING', 'FAILED', 'FREEZE', 'INACTIVE', 'DRAFT'])
  status?: 'ACTIVE' | 'PENDING' | 'FAILED' | 'FREEZE' | 'INACTIVE' | 'DRAFT';

  @ApiPropertyOptional({ type: [String], example: ['Hunter x Hunter', 'Chibi'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  salesAttributes?: Array<{ name: string; value_name: string }>;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(['ACTIVE', 'PENDING', 'FAILED', 'FREEZE', 'INACTIVE', 'DRAFT', 'DELETED'])
  status?:
    | 'ACTIVE'
    | 'PENDING'
    | 'FAILED'
    | 'FREEZE'
    | 'INACTIVE'
    | 'DRAFT'
    | 'DELETED';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateProductSkusDto {
  @ApiProperty({
    description: 'Danh sách SKU cập nhật nhanh Tồn kho (Hàng có sẵn) hoặc Giá bán lẻ',
  })
  @IsArray()
  skus: Array<{
    id?: string;
    sellerSku: string;
    originalPrice: number;
    salePrice: number;
    stockQuantity: number;
    salesAttributes?: Array<{ name: string; value_name: string }>;
  }>;
}

export class BulkProductActionDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  productIds: string[];

  @ApiProperty({
    enum: [
      'ACTIVATE',
      'DEACTIVATE',
      'PENDING',
      'DRAFT',
      'DELETE',
      'ADD_TAG',
      'REMOVE_TAG',
    ],
  })
  @IsIn([
    'ACTIVATE',
    'DEACTIVATE',
    'PENDING',
    'DRAFT',
    'DELETE',
    'ADD_TAG',
    'REMOVE_TAG',
  ])
  action:
    | 'ACTIVATE'
    | 'DEACTIVATE'
    | 'PENDING'
    | 'DRAFT'
    | 'DELETE'
    | 'ADD_TAG'
    | 'REMOVE_TAG';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;
}

export class ManageProductTagDto {
  @ApiProperty({ example: 'Best Seller' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Hot Trend' })
  @IsOptional()
  @IsString()
  newName?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  productIds?: string[];
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
