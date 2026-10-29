import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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

function resolveHeaderLang(
  xLang?: string,
  acceptLang?: string,
): 'vi' | 'en' {
  const raw = (xLang || acceptLang || 'vi').toLowerCase();
  return raw.startsWith('en') ? 'en' : 'vi';
}

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('assets')
  @RequirePermissions(PERMISSIONS.PRODUCTS_READ)
  @ApiOperation({
    summary:
      'Lấy danh sách Category Assets chuẩn TikTok Shop Partner API (202405) theo ngôn ngữ (x-lang: vi | en)',
  })
  async getAuthorizedCategoryAssets(
    @Headers('x-lang') xLang?: string,
    @Headers('accept-language') acceptLang?: string,
  ) {
    return this.categoriesService.getAuthorizedCategoryAssets(
      resolveHeaderLang(xLang, acceptLang),
    );
  }

  @Get('paginated')
  @RequirePermissions(PERMISSIONS.PRODUCTS_READ)
  @ApiOperation({
    summary:
      'Danh sách danh mục có phân trang, tìm kiếm song ngữ (VI/EN), sắp xếp theo cấu trúc Cha - Con liền kề',
  })
  async findPaginated(
    @Query() query: CategoryQueryDto,
    @Headers('x-lang') xLang?: string,
    @Headers('accept-language') acceptLang?: string,
  ) {
    return this.categoriesService.findPaginated(
      query,
      resolveHeaderLang(xLang, acceptLang),
    );
  }

  @Get()
  @RequirePermissions(PERMISSIONS.PRODUCTS_READ)
  @ApiOperation({
    summary:
      'Danh sách toàn bộ danh mục ngành hàng kèm số sản phẩm (cấu trúc Cha - Con, hỗ trợ song ngữ VI/EN)',
  })
  async findAll(
    @Query() query: CategoryQueryDto,
    @Headers('x-lang') xLang?: string,
    @Headers('accept-language') acceptLang?: string,
  ) {
    return this.categoriesService.findAll(
      query,
      resolveHeaderLang(xLang, acceptLang),
    );
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
