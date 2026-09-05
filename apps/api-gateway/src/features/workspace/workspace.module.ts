import { Module } from '@nestjs/common';
import { CacheService } from '../../capabilities/cache/cache.service';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../users/users.repository';
import { MemberRepository } from './member.repository';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceRepository } from './workspace.repository';
import { WorkspaceService } from './workspace.service';

@Module({
  imports: [AuthModule],
  controllers: [WorkspaceController],
  providers: [
    WorkspaceService,
    DatabaseService,
    MemberRepository,
    WorkspaceRepository,
    UsersRepository,
    CacheService,
  ],
})
export class WorkspacesModule {}
