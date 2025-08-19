import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must contain at least 6 letters!' })
  @MaxLength(100, { message: 'Password must contain no more than 100 letters!' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must contain at least 6 letters!' })
  @MaxLength(100, { message: 'Password must contain no more than 100 letters!' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  newPassword: string;
}
