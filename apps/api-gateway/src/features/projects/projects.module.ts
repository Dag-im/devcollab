import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspace/workspace.module';
import { ProjectsController } from './projects.controller';
import { ProjectsRepository } from './projects.repository';
import { ProjectsService } from './projects.service';
import { TasksController } from './tasks/tasks.controller';
import { TasksRepository } from './tasks/tasks.repository';
import { TasksService } from './tasks/tasks.service';

// ProjectsModule
@Module({
  imports: [WorkspacesModule], // needs MemberRepository for assignee validation
  providers: [
    ProjectsService,
    ProjectsRepository,
    TasksService,
    TasksRepository,
  ],
  controllers: [ProjectsController, TasksController],
})
export class ProjectsModule {}
