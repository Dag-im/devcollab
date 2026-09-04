import { Inject, Injectable } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import { DATABASE_POOL } from './database.provider';

@Injectable()
export class DatabaseService {
  constructor(@Inject(DATABASE_POOL) private pool: Pool) {}

  async query<T>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(sql, params);
  }

  async getClient() {
    return this.pool.connect();
  }
}
