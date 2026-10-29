import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  BulkProductActionDto,
  CreateProductDto,
  ImportPlatformProductDto,
  ManageProductTagDto,
  UpdateProductDto,
  UpdateProductSkusDto,
} from './dto/create-product.dto';
import {
  ProductQueryDto,
  TikTokProductTabStatus,
} from './dto/product-query.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('stats')
  @RequirePermissions('products.read')
  @ApiOperation({
    summary:
      'Thống kê số lượng sản phẩm theo 7 tab TikTok Shop Seller Center + Hết hàng + Thẻ',
  })
  async getStats() {
    return this.productsService.getStats();
  }

  @Get('tags')
  @RequirePermissions('products.read')
  @ApiOperation({
    summary: 'Danh sách toàn bộ Thẻ sản phẩm (Product Tags) kèm số sản phẩm gắn thẻ',
  })
  async getTags() {
    return this.productsService.getTags();
  }

  @Post('tags')
  @RequirePermissions('products.manage')
  @ApiOperation({
    summary: 'Tạo thẻ mới hoặc gắn thẻ vào danh sách sản phẩm',
  })
  async createTag(@Body() dto: ManageProductTagDto) {
    return this.productsService.createOrAttachTag(dto);
  }

  @Patch('tags/rename')
  @RequirePermissions('products.manage')
  @ApiOperation({
    summary: 'Đổi tên thẻ sản phẩm đồng loạt',
  })
  async renameTag(@Body() dto: ManageProductTagDto) {
    return this.productsService.renameTag(dto.name, dto.newName || '');
  }

  @Post('tags/delete')
  @RequirePermissions('products.manage')
  @ApiOperation({
    summary: 'Gỡ và xóa thẻ khỏi toàn bộ sản phẩm',
  })
  async deleteTag(@Body() body: { name: string }) {
    return this.productsService.deleteTag(body.name);
  }

  @Get()
  @RequirePermissions('products.read')
  @ApiOperation({
    summary:
      'Danh sách sản phẩm theo 7 tab TikTok Shop Seller Center, tìm kiếm theo Tên/ID/SKU, lọc Hạng mục/Hết hàng/Thẻ & sắp xếp',
  })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Post()
  @RequirePermissions('products.manage')
  @ApiOperation({
    summary: 'Tạo sản phẩm mới (SPU + SKU) gắn vào Danh mục lá chuẩn 202405',
  })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('products.manage')
  @ApiOperation({
    summary: 'Cập nhật thông tin sản phẩm, danh mục lá, thương hiệu, thẻ & trạng thái',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions('products.manage')
  @ApiOperation({
    summary:
      'Cập nhật trạng thái sản phẩm theo 7 tab TikTok Shop (ACTIVE / PENDING / FAILED / INACTIVE / DRAFT / DELETED)',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: TikTokProductTabStatus },
  ) {
    return this.productsService.updateStatus(id, body.status);
  }

  @Patch(':id/skus')
  @RequirePermissions('products.manage')
  @ApiOperation({
    summary:
      'Cập nhật nhanh Tồn kho (Hàng có sẵn) và Giá bán lẻ / Khuyến mãi của từng SKU',
  })
  async updateSkus(
    @Param('id') id: string,
    @Body() dto: UpdateProductSkusDto,
  ) {
    return this.productsService.updateSkus(id, dto);
  }

  @Post('bulk-action')
  @RequirePermissions('products.manage')
  @ApiOperation({
    summary:
      'Thao tác hàng loạt trên nhiều sản phẩm (Đưa lên kệ, Vô hiệu hóa, Xóa, Gắn thẻ)',
  })
  async bulkAction(@Body() dto: BulkProductActionDto) {
    return this.productsService.bulkAction(dto);
  }

  @Post('import-from-platform')
  @RequirePermissions('products.sync')
  @ApiOperation({
    summary: 'Đồng bộ / Copy sản phẩm từ TikTok Shop hoặc Shopee về Web',
  })
  async importFromPlatform(@Body() dto: ImportPlatformProductDto) {
    return this.productsService.importFromPlatform(dto);
  }
}
