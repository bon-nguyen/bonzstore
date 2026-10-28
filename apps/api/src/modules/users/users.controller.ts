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
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('stats')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Thống kê số lượng người dùng' })
  async getStats() {
    return this.usersService.getStats();
  }

  @Get()
  @RequirePermissions('users.read')
  @ApiOperation({
    summary:
      'Danh sách người dùng (Mặc định sort theo vai trò, max 20/trang, ẩn/hash email cấp cao hơn)',
  })
  async findAll(
    @Query() query: UserQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.usersService.findAll(query, currentUser);
  }

  @Post()
  @RequirePermissions('users.create')
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
  @RequirePermissions('users.update')
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
}
