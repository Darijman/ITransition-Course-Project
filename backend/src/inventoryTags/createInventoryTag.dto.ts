import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class CreateInventoryTagDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Title must be a string!' })
  @IsNotEmpty({ message: 'Title is required!' })
  @MaxLength(100, { message: 'Title must be maximum 100 characters!' })
  @Matches(/\S/, { message: 'Title should not be empty or contain only spaces!' })
  title: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Description must be a string!' })
  @MaxLength(255, { message: 'Description can be maximum 255 characters!' })
  @Matches(/\S/, { message: 'Description should not be empty or contain only spaces!' })
  description?: string;
}
