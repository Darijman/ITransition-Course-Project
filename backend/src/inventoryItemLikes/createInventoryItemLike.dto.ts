import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateInventoryItemLikeDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'Item ID must be an integer!' })
  @Min(1, { message: 'Item ID must be positive!' })
  itemId: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'User ID must be an integer!' })
  @Min(1, { message: 'User ID must be positive!' })
  userId: number;
}
