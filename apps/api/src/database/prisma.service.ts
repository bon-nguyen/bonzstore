import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public readonly client: PrismaClient;

  constructor() {
    this.client = new PrismaClient({
      log: ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.client.$connect();
    this.logger.log('Connected to PostgreSQL via Prisma');
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    this.logger.log('Disconnected from PostgreSQL');
  }
}

