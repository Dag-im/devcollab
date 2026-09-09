import { Module } from '@nestjs/common';
import { AttachmentsModule } from '../attachments/attachments.module';
import { AuthModule } from '../auth/auth.module';
import { UsersRepository } from '../users/users.repository';
import { MemberRepository } from '../workspace/member.repository';
import { ProjectsController } from './projects.controller';
import { ProjectsRepository } from './projects.repository';
import { ProjectsService } from './projects.service';
import { TasksController } from './tasks/tasks.controller';
import { TasksRepository } from './tasks/tasks.repository';
import { TasksService } from './tasks/tasks.service';

// ProjectsModule
@Module({
  imports: [AuthModule, AttachmentsModule],
  providers: [
    ProjectsService,
    ProjectsRepository,
    TasksService,
    TasksRepository,
    UsersRepository,
    MemberRepository,
  ],
  controllers: [ProjectsController, TasksController],
})
export class ProjectsModule {}
