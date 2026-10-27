import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('assets')
  @RequirePermissions('products.read')
  @ApiOperation({
    summary:
      'Lấy danh sách Category Assets chuẩn TikTok Shop Partner API (202405)',
  })
  async getAuthorizedCategoryAssets() {
    return this.categoriesService.getAuthorizedCategoryAssets();
  }

  @Get()
  @RequirePermissions('products.read')
  @ApiOperation({ summary: 'Danh sách toàn bộ danh mục ngành hàng kèm số sản phẩm' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @RequirePermissions('products.manage')
  @ApiOperation({ summary: 'Tạo danh mục ngành hàng mới' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Post('sync-tiktok')
  @RequirePermissions('products.sync')
  @ApiOperation({
    summary: 'Đồng bộ cây danh mục từ TikTok Shop (v202405) về hệ thống',
  })
  async syncTikTok() {
    return this.categoriesService.syncTikTokCategoryAssets();
  }
}

