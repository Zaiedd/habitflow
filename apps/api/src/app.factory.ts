import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN')?.split(',') ?? [
      'http://localhost:3000',
    ],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const isCloudflareWorker =
    typeof navigator !== 'undefined' &&
    navigator.userAgent.includes('Cloudflare-Workers');

  if (config.get('NODE_ENV') !== 'production' && !isCloudflareWorker) {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
    const swagger = new DocumentBuilder()
      .setTitle('HabitFlow API')
      .setDescription('HabitFlow — AI personal growth platform')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup(
      'docs',
      app,
      SwaggerModule.createDocument(app, swagger),
    );
  }

  await app.init();
  return app;
}
