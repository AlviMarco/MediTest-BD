import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { parseCsv } from './config/env.validation';

export async function createMediTestApp() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  app.use(helmet());
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const allowedOrigins = parseCsv(configService.get<string>('CORS_ORIGINS'));
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowedOrigin = allowedOrigins.includes(origin);
      const isLocalDevelopmentOrigin =
        !isProduction &&
        /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);

      callback(null, isAllowedOrigin || isLocalDevelopmentOrigin);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MediTest BD API')
    .setDescription('MediTest BD healthcare platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  return { app, apiPrefix, configService };
}

export async function listenForHttpServer() {
  const logger = new Logger('Bootstrap');
  const { app, apiPrefix, configService } = await createMediTestApp();
  const port = configService.get<number>('PORT') || 4000;

  try {
    await app.listen(port);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === 'EADDRINUSE') {
      logger.error(
        `Port ${port} is already in use. Stop the old server first, or run "npm run start:clean" from apps/api.`,
      );
    }
    throw error;
  }

  logger.log(`MediTest BD API is running on http://localhost:${port}/${apiPrefix}`);
  logger.log(`API documentation: http://localhost:${port}/${apiPrefix}/docs`);
}
