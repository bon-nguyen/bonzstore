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
  CreateProductDto,
  ImportPlatformProductDto,
} from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('stats')
  @RequirePermissions('products.read')
  @ApiOperation({ summary: 'Thống kê sản phẩm SPU, SKU và sản phẩm đồng bộ từ sàn' })
  async getStats() {
    return this.productsService.getStats();
  }

  @Get()
  @RequirePermissions('products.read')
  @ApiOperation({ summary: 'Danh sách sản phẩm có phân trang & lọc theo nguồn sàn' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Post()
  @RequirePermissions('products.manage')
  @ApiOperation({ summary: 'Tạo sản phẩm mới (SPU + SKU) gắn vào Danh mục lá' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id/status')
  @RequirePermissions('products.manage')
  @ApiOperation({ summary: 'Cập nhật trạng thái sản phẩm (ACTIVE / INACTIVE / FREEZE)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'FREEZE' },
  ) {
    return this.productsService.updateStatus(id, body.status);
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

