import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { CategoriesService } from './categories.service';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('assets')
  @RequirePermissions(PERMISSIONS.PRODUCTS_READ)
  @ApiOperation({
    summary:
      'Lấy danh sách Category Assets chuẩn TikTok Shop Partner API (202405)',
  })
  async getAuthorizedCategoryAssets() {
    return this.categoriesService.getAuthorizedCategoryAssets();
  }

  @Get('paginated')
  @RequirePermissions(PERMISSIONS.PRODUCTS_READ)
  @ApiOperation({
    summary:
      'Danh sách danh mục có phân trang, tìm kiếm, sắp xếp theo cấu trúc Cha - Con liền kề',
  })
  async findPaginated(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findPaginated(query);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.PRODUCTS_READ)
  @ApiOperation({
    summary:
      'Danh sách toàn bộ danh mục ngành hàng kèm số sản phẩm (cấu trúc Cha - Con)',
  })
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Post()
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.PRODUCTS_MANAGE)
  @ApiOperation({
    summary:
      'Tạo danh mục ngành hàng mới (Chỉ SUPER_ADMIN & STORE_MANAGER)',
  })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.categoriesService.create(dto, currentUser);
  }

  @Patch(':id')
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.PRODUCTS_MANAGE)
  @ApiOperation({
    summary:
      'Chỉnh sửa danh mục ngành hàng (Chỉ SUPER_ADMIN & STORE_MANAGER)',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.categoriesService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.PRODUCTS_MANAGE)
  @ApiOperation({
    summary: 'Xóa danh mục ngành hàng (Chỉ SUPER_ADMIN & STORE_MANAGER)',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.categoriesService.remove(id, currentUser);
  }
}
