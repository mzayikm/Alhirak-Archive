import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsString()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}