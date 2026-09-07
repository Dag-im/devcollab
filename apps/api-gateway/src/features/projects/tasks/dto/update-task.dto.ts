import { TaskStatus } from '@devcollab/common/interfaces/task.interface';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsEnum(TaskStatus, {
    message: `status must be one of the following values: ${Object.values(
      TaskStatus,
    ).join(', ')}`,
  })
  status?: TaskStatus;
}
