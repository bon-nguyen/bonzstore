import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CashbookController } from './cashbook.controller';
import { CashbookService } from './cashbook.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [CashbookController],
  providers: [CashbookService],
  exports: [CashbookService],
})
export class CashbookModule {}

