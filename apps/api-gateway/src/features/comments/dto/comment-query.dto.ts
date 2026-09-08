import {
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CommentQueryDto {
  @IsDateString()
  @IsOptional()
  cursorDate?: string;
  @IsUUID()
  @IsOptional()
  cursorId?: string;
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
