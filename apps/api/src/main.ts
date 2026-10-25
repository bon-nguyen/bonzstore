import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  app.setGlobalPrefix('api');

  const corsOrigin = configService
    .get<string>('CORS_ORIGIN', 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.use(helmet());
  app.use(compression());

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
    new TransformInterceptor(),
    new ClassSerializerInterceptor(reflector),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BonzStore API')
    .setDescription('BonzStore Backend REST API - Authentication & Dynamic RBAC')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', 'Xác thực & Phiên đăng nhập')
    .addTag('users', 'Quản lý người dùng')
    .addTag('roles', 'Quản lý Vai trò & Phân quyền (RBAC)')
    .addTag('health', 'Kiểm tra hệ thống')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  logger.log(`🚀 BonzStore API running on http://localhost:${port}/api`);
  logger.log(`📚 Swagger Docs available at http://localhost:${port}/api/docs`);
}

bootstrap();

