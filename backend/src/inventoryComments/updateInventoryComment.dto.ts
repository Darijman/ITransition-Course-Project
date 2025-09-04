import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateInventoryCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(1)
  @Matches(/\S/, { message: 'Name should not be empty or contain only spaces!' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  text: string;
}
