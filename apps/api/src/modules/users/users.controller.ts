import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Danh sách người dùng có phân trang & bộ lọc' })
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  @RequirePermissions('users.create')
  @ApiOperation({ summary: 'Tạo người dùng mới và gán Role' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('users.update')
  @ApiOperation({ summary: 'Cập nhật thông tin, trạng thái hoặc Role người dùng' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}

