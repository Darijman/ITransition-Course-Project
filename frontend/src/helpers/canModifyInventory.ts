import { BasicUser } from '@/interfaces/users/BasicUser';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import { UserRoles } from '@/interfaces/users/UserRoles.enum';

export const canModifyInventory = (inventoryUser: InventoryUser | null, authUser: BasicUser): boolean => {
  if (!authUser) return false;
  if (authUser.role === UserRoles.ADMIN) return true;
  if (!inventoryUser) return false;

  return [InventoryUserRoles.ADMIN, InventoryUserRoles.CREATOR, InventoryUserRoles.EDITOR].includes(inventoryUser.role);
};
