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
  CreateTestNotificationDto,
  MarkNotificationReadDto,
  NotificationQueryDto,
  UpdateNotificationSettingsDto,
} from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  findPaginated(@Query() query: NotificationQueryDto) {
    return this.notificationsService.findPaginated(query);
  }

  @Get('stats')
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  getStats() {
    return this.notificationsService.getStats();
  }

  @Get('settings')
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  getSettings() {
    return this.notificationsService.getSettings();
  }

  @Patch('settings')
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  updateSettings(
    @Body() dto: UpdateNotificationSettingsDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.notificationsService.updateSettings(dto, currentUser);
  }

  @Post('settings/reset')
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  resetSettings(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.notificationsService.resetSettings(currentUser);
  }

  @Post('test')
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  createTestNotification(
    @Body() dto: CreateTestNotificationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.notificationsService.createTestNotification(dto, currentUser);
  }

  @Post('read-all')
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  markAllAsRead() {
    return this.notificationsService.markAllAsRead();
  }

  @Delete('clear-read')
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  clearRead() {
    return this.notificationsService.clearRead();
  }

  @Patch(':id/read')
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  markAsRead(@Param('id') id: string, @Body() dto: MarkNotificationReadDto) {
    return this.notificationsService.markAsRead(id, dto.isRead ?? true);
  }

  @Delete(':id')
  @Roles(...ADMIN_MANAGER_ROLES)
  @RequirePermissions(PERMISSIONS.DASHBOARD_VIEW)
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}

