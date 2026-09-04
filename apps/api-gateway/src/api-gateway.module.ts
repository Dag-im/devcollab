import { ResponseInterceptor } from '@devcollab/common/interceptors/response.interceptor';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthModule } from './auth/auth.module';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  kafkaConfig,
  redisConfig,
  validationSchema,
} from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, kafkaConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false, // show ALL missing vars at once, not just the first
      },
    }),
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(databaseConfig),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(redisConfig),
    ConfigModule.forFeature(kafkaConfig),
    DatabaseModule,
    UsersModule,
    AuthModule,
    CacheModule,
  ],
  controllers: [ApiGatewayController],
  providers: [
    ApiGatewayService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class ApiGatewayModule {}
