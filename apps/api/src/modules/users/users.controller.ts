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
import { CreateUserDto } from './dto/create-user.dto';
import { ResetUserPasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Roles(...ADMIN_MANAGER_ROLES)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('stats')
  @RequirePermissions(PERMISSIONS.USERS_READ)
  @ApiOperation({
    summary:
      'Thống kê số lượng người dùng (Chỉ SUPER_ADMIN & STORE_MANAGER)',
  })
  async getStats(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.usersService.getStats(currentUser);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.USERS_READ)
  @ApiOperation({
    summary:
      'Danh sách người dùng (Chỉ SUPER_ADMIN & STORE_MANAGER được quyền xem)',
  })
  async findAll(
    @Query() query: UserQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.findAll(query, currentUser);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USERS_READ)
  @ApiOperation({
    summary:
      'Xem chi tiết thông tin người dùng (Chỉ SUPER_ADMIN & STORE_MANAGER)',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.findOne(id, currentUser);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USERS_CREATE)
  @ApiOperation({
    summary:
      'Tạo người dùng mới (Chặn quyền thấp hơn tạo tài khoản SUPER_ADMIN)',
  })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.create(dto, currentUser);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USERS_UPDATE)
  @ApiOperation({
    summary:
      'Cập nhật thông tin, trạng thái hoặc Role (Chặn STORE_MANAGER sửa quyền SUPER_ADMIN)',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.update(id, dto, currentUser);
  }

  @Patch(':id/reset-password')
  @RequirePermissions(PERMISSIONS.USERS_UPDATE)
  @ApiOperation({
    summary:
      'Reset mật khẩu người dùng & thu hồi các phiên đăng nhập cũ (Chặn STORE_MANAGER reset mật khẩu SUPER_ADMIN)',
  })
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetUserPasswordDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.resetPassword(id, dto.newPassword, currentUser);
  }
}
