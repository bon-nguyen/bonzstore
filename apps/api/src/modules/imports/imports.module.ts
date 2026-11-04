import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { CashbookModule } from '../cashbook/cashbook.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  ImportsController,
  MainOrderCompatController,
} from './imports.controller';
import { ImportsService } from './imports.service';

@Module({
  imports: [PrismaModule, NotificationsModule, CashbookModule],
  controllers: [ImportsController, MainOrderCompatController],
  providers: [ImportsService],
  exports: [ImportsService],
})
export class ImportsModule {}

