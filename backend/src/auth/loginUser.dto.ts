import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must contain no more than 255 characters!' })
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must contain at least 6 letters!' })
  @MaxLength(40, { message: 'Password must contain no more than 40 letters!' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  password: string;
}
