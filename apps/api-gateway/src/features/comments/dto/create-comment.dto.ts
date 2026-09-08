import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MaxLength(2000)
  @MinLength(1)
  body!: string;
}
