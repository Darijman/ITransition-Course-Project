import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNotEmpty, IsInt, MaxLength, MinLength, Min, IsArray, ArrayNotEmpty, IsBoolean } from 'class-validator';

export class CreateInventoryDto {
  @IsString({ message: 'Title must be a string!' })
  @IsNotEmpty({ message: 'Title is required!' })
  @MaxLength(100, { message: 'Title must be maximum 100 characters!' })
  @MinLength(1, { message: 'Title must be at least 1 character!' })
  title: string;

  @IsString({ message: 'Description must be a string!' })
  @IsOptional()
  @MaxLength(255, { message: 'Description can be maximum 255 characters!' })
  description?: string;

  @IsArray({ message: 'Tags must be an array of IDs!' })
  @ArrayNotEmpty({ message: 'At least one tag ID is required!' })
  @IsInt({ each: true, message: 'Each tag ID must be an integer!' })
  @Min(1, { each: true, message: 'Each tag ID must be positive!' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  tagIds: number[];

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'Inventory category ID must be an integer!' })
  @Min(1, { message: 'Inventory category ID must be positive!' })
  categoryId: number;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean({ message: 'isPublic must be a boolean!' })
  isPublic: boolean;
}
