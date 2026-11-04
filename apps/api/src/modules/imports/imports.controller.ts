import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  FetchExternalOrderDto,
  HoabinhLoginDto,
  ImportOrderQueryDto,
  SaveImportTokenDto,
  SyncImportOrderCatalogDto,
  UpdateImportOrderDto,
} from './dto/import-order.dto';
import { ImportsService } from './imports.service';

@ApiTags('imports')
@ApiBearerAuth()
@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Get('stats')
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Thống kê tổng quan Nhập hàng Hoà Bình Logistics & 1688 (Tự động restore data khi gọi API)',
  })
  async getStats() {
    return this.importsService.getStats();
  }

  @Get('token')
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary: 'Lấy cấu hình Token Hoà Bình Logistics hiện tại (Đã che bảo mật)',
  })
  async getTokenConfig() {
    return this.importsService.getTokenConfig();
  }

  @Post('authenticate/login')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Xác thực & Đăng nhập Hoà Bình Logistics (POST https://hoabinhlogistics.com/api/authenticate/login) -> Lưu JWT Token & giải mã UID=6176',
  })
  async authenticateLogin(
    @Body() dto: HoabinhLoginDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.importsService.authenticateHoabinhLogin(dto, currentUser);
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Lưu Bearer Token sau khi đăng nhập tab Hoà Bình Logistics (Chỉ SUPER_ADMIN & STORE_MANAGER)',
  })
  async saveTokenConfig(
    @Body() dto: SaveImportTokenDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.importsService.saveTokenConfig(dto, currentUser);
  }

  @Post('fetch-order')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Lấy chi tiết đơn từ https://hoabinhlogistics.com/api/main-order/:id (Kèm cơ chế Auto-Restore Data & đồng bộ Sản phẩm + Sổ quỹ)',
  })
  async fetchExternalOrder(
    @Body() dto: FetchExternalOrderDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.importsService.fetchAndStoreExternalOrder(dto, currentUser);
  }

  @Post('restore')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Khôi phục (Restore) toàn bộ dữ liệu đơn nhập hàng #55479, đồng bộ Kho Sản Phẩm (/products) và Sổ Quỹ (/cashbook)',
  })
  async restoreDefaultData(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.importsService.restoreDefaultData(currentUser);
  }

  @Public()
  @Get('main-order/:id')
  @ApiOperation({
    summary:
      'Endpoint tương thích 100% cấu trúc https://hoabinhlogistics.com/api/main-order/55479 (Tự động restore data khi gọi API)',
  })
  async getRawMainOrder(@Param('id', ParseIntPipe) id: number) {
    return this.importsService.getRawMainOrderResponse(id);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Danh sách các đơn nhập hàng đã lưu trữ (Có phân trang, tìm kiếm mã đơn / mã vận đơn / sản phẩm 1688)',
  })
  async findAll(@Query() query: ImportOrderQueryDto) {
    return this.importsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary: 'Xem chi tiết đơn nhập hàng (Orders, SmallPackages, PayOrderHistories, OrderComments)',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.importsService.findOne(id);
  }

  @Post(':id/sync-catalog')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Đồng bộ các sản phẩm 1688 trong đơn nhập hàng vào Kho Sản Phẩm Production (/products) và Sổ Quỹ (/cashbook)',
  })
  async syncOrderToCatalog(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SyncImportOrderCatalogDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.importsService.syncOrderToCatalogManual(id, dto, currentUser);
  }

  @Patch(':id')
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary: 'Cập nhật ghi chú nội bộ và trạng thái đơn nhập hàng',
  })
  async updateOrderNotes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateImportOrderDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.importsService.updateOrderNotes(id, dto, currentUser);
  }
}

@ApiTags('main-order')
@Controller('main-order')
export class MainOrderCompatController {
  constructor(private readonly importsService: ImportsService) {}

  @Public()
  @Get(':id')
  @ApiOperation({
    summary:
      'Mirror endpoint GET /api/main-order/:id chuẩn Hoà Bình Logistics (Auto-restore data khi gọi API)',
  })
  async getMainOrder(@Param('id', ParseIntPipe) id: number) {
    return this.importsService.getRawMainOrderResponse(id);
  }
}

