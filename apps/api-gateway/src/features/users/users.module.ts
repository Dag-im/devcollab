import { Module } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, DatabaseService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
