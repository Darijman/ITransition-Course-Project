import { IsEmail, IsEnum, IsInt, IsDateString, IsOptional } from 'class-validator';
import { InventoryUserRoles } from 'src/inventoryUsers/inventoryUserRoles.enum';

export class CreateInventoryInviteDto {
  @IsInt()
  inventoryId: number; // В какой инвентарь приглашаем

  @IsInt()
  inviterInventoryUserId: number; // Кто приглашает (InventoryUser)

  @IsEmail()
  inviteeEmail: string; // Кого приглашаем

  @IsEnum(InventoryUserRoles)
  role: InventoryUserRoles = InventoryUserRoles.VIEWER; // Роль по умолчанию viewer

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
