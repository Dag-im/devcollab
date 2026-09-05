import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkspaceDto } from './create-workspace';

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {}
