import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Danh sách tất cả quyền hạn (Permissions catalog)' })
  async findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Get()
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Danh sách tất cả vai trò (Roles) kèm quyền hạn' })
  async findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @RequirePermissions('roles.manage')
  @ApiOperation({ summary: 'Tạo vai trò mới và gán quyền hạn' })
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('roles.manage')
  @ApiOperation({ summary: 'Cập nhật vai trò và danh sách quyền hạn' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }
}

