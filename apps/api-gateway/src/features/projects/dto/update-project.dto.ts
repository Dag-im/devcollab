import { ProjectStatus } from '@devcollab/common/interfaces/project.interface';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsEnum(ProjectStatus, {
    message: `status must be one of the following values: ${Object.values(
      ProjectStatus,
    ).join(', ')}`,
  })
  status?: ProjectStatus;
}
