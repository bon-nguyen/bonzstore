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
import { CashbookService } from './cashbook.service';
import {
  CashbookQueryDto,
  CreateCashbookVoucherDto,
  UpdateCashbookVoucherDto,
  UpdateOpeningBalanceDto,
} from './dto/cashbook.dto';

@ApiTags('cashbook')
@ApiBearerAuth()
@Controller('cashbook')
export class CashbookController {
  constructor(private readonly cashbookService: CashbookService) {}

  @Get('summary')
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Tổng hợp Sổ Quỹ: Đầu kỳ, Tổng thu (+Tiền mặt, +Thẻ, +Chuyển khoản), Tổng chi (+Tiền mặt, +Thẻ, +Chuyển khoản), Cuối kỳ = Đầu kỳ + Tổng thu - Tổng chi',
  })
  async getSummary(@Query() query: CashbookQueryDto) {
    return this.cashbookService.getSummary(query);
  }

  @Get('charts')
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Dữ liệu Biểu đồ & Phân tích Dòng tiền, Kênh thanh toán và Cơ cấu chi phí Đơn nhập hàng #55479',
  })
  async getChartsAnalytics() {
    return this.cashbookService.getChartsAnalytics();
  }

  @Get()
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Danh sách phiếu Thu/Chi Sổ Quỹ có phân trang, tìm kiếm và lọc theo kỳ/phân loại/kênh thanh toán (Tự động restore data khi gọi API)',
  })
  async findAll(@Query() query: CashbookQueryDto) {
    return this.cashbookService.findAll(query);
  }

  @Post()
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Lập Phiếu Thu (INCOME) hoặc Lập Phiếu Chi (EXPENSE) (Chỉ SUPER_ADMIN & STORE_MANAGER)',
  })
  async createVoucher(
    @Body() dto: CreateCashbookVoucherDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.cashbookService.createVoucher(dto, currentUser);
  }

  @Patch('opening-balance')
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Cập nhật Số dư Đầu kỳ theo Tiền mặt / Thẻ / Chuyển khoản (Chỉ SUPER_ADMIN & STORE_MANAGER)',
  })
  async updateOpeningBalance(
    @Body() dto: UpdateOpeningBalanceDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.cashbookService.updateOpeningBalance(dto, currentUser);
  }

  @Post('restore')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary:
      'Khôi phục (Restore) dữ liệu gốc Sổ Quỹ kèm các phiếu thanh toán của đơn nhập #55479',
  })
  async restoreDefaultData(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.cashbookService.restoreDefaultData(currentUser);
  }

  @Patch(':id')
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary: 'Chỉnh sửa phiếu Thu/Chi trong Sổ Quỹ',
  })
  async updateVoucher(
    @Param('id') id: string,
    @Body() dto: UpdateCashbookVoucherDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.cashbookService.updateVoucher(id, dto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  @ApiOperation({
    summary: 'Xóa phiếu Thu/Chi khỏi Sổ Quỹ',
  })
  async deleteVoucher(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.cashbookService.deleteVoucher(id, currentUser);
  }
}

