import { TaskPriority } from '@devcollab/common/interfaces/task.interface';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3, {
    message: 'title must be longer than or equal to 3 characters',
  })
  @MaxLength(255, {
    message: 'title must be shorter than or equal to 255 characters',
  })
  title!: string;
  @IsString()
  @IsOptional()
  @MaxLength(2000, {
    message: 'description must be shorter than or equal to 2000 characters',
  })
  description?: string;

  @IsEnum(TaskPriority, {
    message: `priority must be one of the following values: ${Object.values(
      TaskPriority,
    ).join(', ')}`,
  })
  @IsOptional()
  priority?: TaskPriority;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
