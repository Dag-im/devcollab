import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(3, {
    message: 'Workspace name must be at least 3 characters long',
  })
  @MaxLength(50, {
    message: 'Workspace name must be at most 50 characters long',
  })
  name!: string;
  @IsString()
  @MaxLength(100, {
    message: 'Workspace description must be at most 100 characters long',
  })
  description?: string;
}
