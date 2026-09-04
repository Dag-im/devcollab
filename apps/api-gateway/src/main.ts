import { ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ApiGatewayModule } from './api-gateway.module';
import { appConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties not in DTO
      forbidNonWhitelisted: true, // throw if extra properties sent
      transform: true, // auto-transform payloads to DTO instances
    }),
  );
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: config.nodeEnv === 'production' ? (allowedOrigins ?? false) : true,
  });
  app.enableShutdownHooks();

  const port = config.port;
  await app.listen(port);

  console.log(`DevCollab API running on port ${port}`);
}
bootstrap();
