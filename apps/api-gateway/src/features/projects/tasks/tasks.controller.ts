import { Member } from '@devcollab/common/interfaces/member.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'apps/api-gateway/src/common/guards/jwt-auth.guard';
import { WorkspaceGuard } from 'apps/api-gateway/src/common/guards/workspace.guard';
import { CurrentMember } from '../../auth/decorators/current-member';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('workspaces/:workspaceId/projects/:projectId/tasks')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}
  @Get()
  findAll(@Param('projectId') projectId: string, @Query() query: TaskQueryDto) {
    return this.tasksService.findAll(projectId, query);
  }
  @Get(':taskId')
  findOne(@Param('taskId') taskId: string) {
    return this.tasksService.findOne(taskId);
  }
  @Post()
  create(
    @Body() dto: CreateTaskDto,
    @CurrentMember() member: Member,
    @Param('projectId') id: string,
  ) {
    return this.tasksService.create(dto, id, member);
  }
  @Patch(':taskId')
  update(
    @Param('taskId') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentMember() member: Member,
  ) {
    return this.tasksService.update(id, dto, member);
  }
  @Delete(':taskId')
  delete(@Param('taskId') id: string) {
    return this.tasksService.delete(id);
  }
}
