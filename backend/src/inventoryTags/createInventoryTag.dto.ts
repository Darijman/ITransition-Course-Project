import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateInventoryTagDto {
  @IsString({ message: 'Title must be a string!' })
  @IsNotEmpty({ message: 'Title is required!' })
  @MaxLength(100, { message: 'Title must be maximum 100 characters!' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string!' })
  @MaxLength(1000, { message: 'Description can be maximum 1000 characters!' })
  description?: string;
}
