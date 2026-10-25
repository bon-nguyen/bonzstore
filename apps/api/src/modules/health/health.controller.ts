import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Kiểm tra trạng thái hoạt động của API & Database' })
  async check() {
    let dbStatus = 'connected';
    try {
      await this.prisma.client.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: 'ok',
      service: 'bonzstore-api',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}

