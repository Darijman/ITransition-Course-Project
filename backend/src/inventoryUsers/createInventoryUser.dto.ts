import { IsEnum, IsInt, Min } from 'class-validator';
import { InventoryUserRoles } from './inventoryUserRoles.enum';
import { Transform } from 'class-transformer';

export class CreateInventoryUserDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'User ID must be an integer!' })
  @Min(1, { message: 'User ID must be positive!' })
  userId: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'Inventory ID must be an integer!' })
  @Min(1, { message: 'Inventory ID must be positive!' })
  inventoryId: number;

  @IsEnum(InventoryUserRoles, { message: 'Role must be one of: OWNER, EDITOR, VIEWER' })
  role: InventoryUserRoles;
}
