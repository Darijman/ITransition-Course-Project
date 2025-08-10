import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { UserRoles } from './userRoles.enum';

export class CreateUserDto {
  @IsString({ message: 'Name should be a string!' })
  @IsNotEmpty({ message: 'Name should not be empty!' })
  @MaxLength(100, { message: 'Name should be no more than 100 characters!' })
  @MinLength(1, { message: 'Name should be at least 1 character!' })
  @Matches(/\S/, { message: 'Name must not be blank' })
  name: string;

  @IsEmail({}, { message: 'Email must be valid!' })
  @IsNotEmpty({ message: 'Email should not be empty!' })
  email: string;

  @IsString({ message: 'Password must be string!' })
  @IsNotEmpty({ message: 'Password should not be empty!' })
  @MinLength(6, { message: 'Password must be at least 6 characters!' })
  @Matches(/\S/, { message: 'Password must not be blank' })
  password: string;

  @IsOptional()
  @IsEnum(UserRoles)
  role?: UserRoles;
}
