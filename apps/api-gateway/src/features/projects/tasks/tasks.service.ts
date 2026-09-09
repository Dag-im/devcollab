import { Member } from '@devcollab/common/interfaces/member.interface';
import { CursorPaginatedResponse } from '@devcollab/common/interfaces/pagination.interface';
import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskWithAssignee,
} from '@devcollab/common/interfaces/task.interface';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttachmentService } from '../../attachments/attachment.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private attachmentsService: AttachmentService,
  ) {}
  async create(
    dto: CreateTaskDto,
    projectId: string,
    member: Member,
  ): Promise<Task> {
    return this.tasksRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority || TaskPriority.LOW,
      status: TaskStatus.TODO,
      project_id: projectId,
      created_by: member.id,
      assignee_id: dto.assigneeId ?? null,
      due_date: dto.dueDate ? new Date(dto.dueDate) : null,
    });
  }
  async findAll(
    projectId: string,
    query: TaskQueryDto,
  ): Promise<CursorPaginatedResponse<TaskWithAssignee>> {
    const tasks = await this.tasksRepository.findByProjectId(projectId, query);
    const hasNextPage = tasks.length > (query.limit ?? 20);
    const limitedTasks = hasNextPage ? tasks.slice(0, query.limit) : tasks;
    return {
      data: limitedTasks,
      pagination: {
        limit: query.limit ?? 20,
        nextCursor: hasNextPage
          ? {
              date: limitedTasks[
                limitedTasks.length - 1
              ].created_at.toISOString(),
              id: limitedTasks[limitedTasks.length - 1].id,
            }
          : null,
        hasNextPage,
      },
    };
  }
  async findOne(taskId: string): Promise<TaskWithAssignee> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }
  async update(
    taskId: string,
    dto: UpdateTaskDto,
    member: Member,
  ): Promise<Task> {
    const existing = await this.tasksRepository.findById(taskId);
    if (!existing) throw new NotFoundException('Task not found');

    if (dto.status && dto.status !== existing.status) {
      const isAssignee = existing.assignee_id === member.id;
      const isPrivileged = member.role === 'OWNER' || member.role === 'ADMIN';
      if (!isAssignee && !isPrivileged) {
        throw new ForbiddenException(
          'Only the assignee or a privileged member can update the task status',
        );
      }
    }

    return this.tasksRepository.update(taskId, dto);
  }
  async delete(taskId: string): Promise<void> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    await this.attachmentsService.deleteByTaskId(taskId);
    await this.tasksRepository.softDelete(taskId);
  }
}
