import { IsInt, IsNotEmpty, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInventoryCommentDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Text must be a string' })
  @IsNotEmpty({ message: 'Text should not be empty' })
  @MaxLength(2200, { message: 'Text can contain maximum 2200 characters! ' })
  @MinLength(1, { message: 'Text should be at least 1 character!' })
  @Matches(/\S/, { message: 'Text should not be empty or contain only spaces!' })
  text: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'Inventory ID must be an integer' })
  @Min(1, { message: 'Inventory ID must be positive' })
  inventoryId: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'Author ID must be an integer' })
  @Min(1, { message: 'Author ID must be positive' })
  authorId: number;
}
