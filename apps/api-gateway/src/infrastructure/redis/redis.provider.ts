import { ConfigType } from '@nestjs/config';
import Redis from 'ioredis';
import { redisConfig } from '../../config/configuration';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider = {
  provide: REDIS_CLIENT,
  inject: [redisConfig.KEY],
  useFactory: (config: ConfigType<typeof redisConfig>): Redis => {
    const client = new Redis(config.url);

    client.on('connect', () => console.log('Redis connected'));
    client.on('error', (err) => console.error('Redis error:', err));

    return client;
  },
};
