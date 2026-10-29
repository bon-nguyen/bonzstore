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
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
} from '../../common/constants/rbac.constants';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
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
  ProductTagQueryDto,
  TikTokProductTabStatus,
} from './dto/product-query.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('stats')
  @RequirePermissions(PERMISSIONS.PRODUCTS_READ)
  @ApiOperation({
    summary:
      'Thống kê số lượng sản phẩm theo 7 tab TikTok Shop Seller Center + Hết hàng + Thẻ',
  })
  async getStats() {
    return this.productsService.getStats();
  }

  @Get('tags/paginated')
  @RequirePermissions(PERMISSIONS.PRODUCTS_READ)
  @ApiOperation({
    summary:
      'Danh sách Thẻ sản phẩm (Product Tags) có phân trang, tìm kiếm và sắp xếp theo Tên thẻ / Số sản phẩm',
  })
  async getPaginatedTags(@Query() query: ProductTagQueryDto) {
    return this.productsService.getPaginatedTags(query);
  }

  @Get('tags')
  @RequirePermissions(PERMISSIONS.PRODUCTS_READ)
  @ApiOperation({
    summary:
      'Danh sách toàn bộ Thẻ sản phẩm (Product Tags) kèm số sản phẩm gắn thẻ',
  })
  async getTags() {
    return this.productsService.getTags();
  }

  @Post('tags')
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.PRODUCTS_MANAGE)
  @ApiOperation({
    summary:
      'Tạo thẻ mới hoặc gắn thẻ vào danh sách sản phẩm (Chỉ SUPER_ADMIN & STORE_MANAGER)',
  })
  async createTag(
    @Body() dto: ManageProductTagDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.productsService.createOrAttachTag(dto, currentUser);
  }

  @Patch('tags/rename')
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.PRODUCTS_MANAGE)
  @ApiOperation({
    summary:
      'Đổi tên thẻ sản phẩm đồng loạt (Chỉ SUPER_ADMIN & STORE_MANAGER)',
  })
  async renameTag(
    @Body() dto: ManageProductTagDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.productsService.renameTag(
      dto.name,
      dto.newName || '',
      currentUser,
    );
  }

  @Post('tags/delete')
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.PRODUCTS_MANAGE)
  @ApiOperation({
    summary:
      'Gỡ và xóa thẻ khỏi toàn bộ sản phẩm (Chỉ SUPER_ADMIN & STORE_MANAGER)',
  })
  async deleteTag(
    @Body() body: { name: string },
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.productsService.deleteTag(body.name, currentUser);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.PRODUCTS_READ)
  @ApiOperation({
    summary:
      'Danh sách sản phẩm theo 7 tab TikTok Shop Seller Center, tìm kiếm theo Tên/ID/SKU, lọc Hạng mục/Hết hàng/Thẻ & sắp xếp',
  })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.PRODUCTS_MANAGE)
  @ApiOperation({
    summary: 'Tạo sản phẩm mới (SPU + SKU) gắn vào Danh mục lá chuẩn 202405',
  })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.PRODUCTS_MANAGE)
  @ApiOperation({
    summary:
      'Cập nhật thông tin sản phẩm, danh mục lá, thương hiệu, thẻ & trạng thái',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/status')
  @RequirePermissions(PERMISSIONS.PRODUCTS_MANAGE)
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
  @RequirePermissions(PERMISSIONS.PRODUCTS_MANAGE)
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
  @RequirePermissions(PERMISSIONS.PRODUCTS_MANAGE)
  @ApiOperation({
    summary:
      'Thao tác hàng loạt trên nhiều sản phẩm (Đưa lên kệ, Vô hiệu hóa, Xóa, Gắn thẻ)',
  })
  async bulkAction(@Body() dto: BulkProductActionDto) {
    return this.productsService.bulkAction(dto);
  }

  @Post('import-from-platform')
  @RequirePermissions(PERMISSIONS.PRODUCTS_SYNC)
  @ApiOperation({
    summary: 'Đồng bộ / Copy sản phẩm từ TikTok Shop hoặc Shopee về Web',
  })
  async importFromPlatform(@Body() dto: ImportPlatformProductDto) {
    return this.productsService.importFromPlatform(dto);
  }
}
