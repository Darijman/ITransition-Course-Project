import { Transform } from 'class-transformer';
import { IsString, IsOptional, MaxLength, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class CreateInventoryCategoryDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Title must be a string' })
  @MaxLength(100, { message: 'Title can contain maximum 100 characters' })
  @MinLength(1, { message: 'Title must be at least 1 character!' })
  @Matches(/\S/, { message: 'Title should not be empty or contain only spaces!' })
  @IsNotEmpty({ message: 'Title should not be empty!' })
  title: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/\S/, { message: 'Description should not be empty or contain only spaces!' })
  @IsString({ message: 'Description must be a string' })
  @MaxLength(255, { message: 'Description can contain maximum 255 characters' })
  description?: string;
}
