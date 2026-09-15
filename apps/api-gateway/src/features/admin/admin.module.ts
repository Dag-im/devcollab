import { Module } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../users/users.repository';
import { AdminController } from './admin.controller';
import { AdminServices } from './admin.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminServices, DatabaseService, UsersRepository],
})
export class AdminModule {}
