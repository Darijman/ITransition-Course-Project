import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsEnum, Matches } from 'class-validator';
import { UserRoles } from 'src/users/userRoles.enum';

export class RegisterUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Name must contain at least 1 letter!' })
  @MaxLength(100, { message: 'Name must contain no more than 100 letters!' })
  @Matches(/\S/, { message: 'Name should not be empty or contain only spaces!' })
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail({}, { message: 'Invalid email format' })
  @IsString()
  @MaxLength(255, { message: 'Email must contain no more than 255 characters!' })
  @Matches(/\S/, { message: 'Email should not be empty or contain only spaces!' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must contain at least 6 letters!' })
  @MaxLength(100, { message: 'Password must contain no more than 100 letters!' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/\S/, { message: 'Password should not be empty or contain only spaces!' })
  password: string;

  @IsOptional()
  @IsEnum(UserRoles)
  role?: UserRoles;
}
