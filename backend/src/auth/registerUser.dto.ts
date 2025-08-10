import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { UserRoles } from 'src/users/userRoles.enum';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Name must contain at least 1 letter!' })
  @MaxLength(100, { message: 'Name must contain no more than 100 letters!' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must contain no more than 255 characters!' })
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must contain at least 6 letters!' })
  @MaxLength(50, { message: 'Password must contain no more than 50 letters!' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  password: string;

  @IsOptional()
  @IsEnum(UserRoles)
  role?: UserRoles;
}
