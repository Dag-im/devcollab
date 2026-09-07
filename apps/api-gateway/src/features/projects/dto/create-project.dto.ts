/**name — string, min 3, max 255, required
description — string, max 500, optional */

import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(3, {
    message: 'name must be longer than or equal to 3 characters',
  })
  @MaxLength(255, {
    message: 'name must be shorter than or equal to 255 characters',
  })
  name!: string;
  @IsString()
  @IsOptional()
  @MaxLength(500, {
    message: 'description must be shorter than or equal to 500 characters',
  })
  description?: string;
}
