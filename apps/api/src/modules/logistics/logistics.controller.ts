import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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
import {
  CreateLogisticsUnitDto,
  LogisticsQueryDto,
  UpdateLogisticsUnitDto,
} from './dto/logistics.dto';
import { LogisticsService } from './logistics.service';

@Controller('logistics')
@Roles(...ADMIN_MANAGER_ROLES)
@RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get()
  findAll(
    @Query() query: LogisticsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.logisticsService.findAll(query, user);
  }

  @Post()
  create(
    @Body() dto: CreateLogisticsUnitDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.logisticsService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLogisticsUnitDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.logisticsService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.logisticsService.remove(id, user);
  }
}

