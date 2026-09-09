import { ResponseInterceptor } from '@devcollab/common/interceptors/response.interceptor';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { CacheModule } from './capabilities/cache/cache.module';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  kafkaConfig,
  redisConfig,
  storageConfig,
  validationSchema,
} from './config/configuration';
import { AttachmentsModule } from './features/attachments/attachments.module';
import { AuthModule } from './features/auth/auth.module';
import { CommentsModule } from './features/comments/comments.module';
import { ProjectsModule } from './features/projects/projects.module';
import { UsersModule } from './features/users/users.module';
import { WorkspacesModule } from './features/workspace/workspace.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { StorageModule } from './infrastructure/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        redisConfig,
        kafkaConfig,
        storageConfig,
      ],
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
    ConfigModule.forFeature(storageConfig),
    DatabaseModule,
    RedisModule,
    StorageModule,
    UsersModule,
    AuthModule,
    CacheModule,
    WorkspacesModule,
    ProjectsModule,
    CommentsModule,
    AttachmentsModule,
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
