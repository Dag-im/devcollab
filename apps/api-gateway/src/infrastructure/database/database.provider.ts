import { ConfigType } from '@nestjs/config';
import { Pool } from 'pg';
import { databaseConfig } from '../../config/configuration';

export const DATABASE_POOL = 'DATABASE_POOL';

export const databaseProviders = [
  {
    provide: DATABASE_POOL,
    inject: [databaseConfig.KEY],
    useFactory: (config: ConfigType<typeof databaseConfig>) => {
      return new Pool({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.name,
        max: 20, // max connections in pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    },
  },
];
