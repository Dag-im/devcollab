import { Module } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, DatabaseService],
  exports: [UsersService],
})
export class UsersModule {}
