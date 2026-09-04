import { Module } from '@nestjs/common';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { CacheController } from './cache.controller';
import { CacheService } from './cache.service';

@Module({
  controllers: [CacheController],
  providers: [CacheService, RedisService],
})
export class CacheModule {}
