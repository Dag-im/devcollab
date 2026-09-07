import {
  TaskPriority,
  TaskStatus,
} from '@devcollab/common/interfaces/task.interface';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class TaskQueryDto {
  @IsOptional()
  @IsEnum(TaskStatus, {
    message: `status must be one of the following values: ${Object.values(
      TaskStatus,
    ).join(', ')}`,
  })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, {
    message: `priority must be one of the following values: ${Object.values(
      TaskPriority,
    ).join(', ')}`,
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsDateString()
  cursorDate?: string;

  @IsOptional()
  @IsUUID()
  cursorId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
