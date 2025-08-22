import { BasicUser } from '@/interfaces/BasicUser';
import { InventoryUser } from '@/interfaces/InventoryUser';
import { InventoryUserRoles } from '@/interfaces/InventoryUserRoles';
import { UserRoles } from '@/interfaces/UserRoles.enum';

export const canModifyInventory = (inventoryUser: InventoryUser | null, authUser: BasicUser): boolean => {
  if (!authUser) return false;
  if (authUser.role === UserRoles.ADMIN) return true;
  if (!inventoryUser) return false;

  return [InventoryUserRoles.ADMIN, InventoryUserRoles.CREATOR, InventoryUserRoles.EDITOR].includes(inventoryUser.role);
};
