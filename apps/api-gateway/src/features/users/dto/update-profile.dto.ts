import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @IsUrl()
  @IsOptional()
  avatar_url?: string;
}
