import { Inventory } from './Inventory';
import { InventoryComment } from './InventoryComment';
import { InventoryItem } from './InventoryItem';
import { User } from './User';
import { UserRoles } from './UserRoles.enum';

export interface InventoryUser {
  id: number;
  name: string;

  user?: User;
  userId: number;

  inventory?: Inventory;
  inventoryId: number;

  comments?: InventoryComment[];
  items?: InventoryItem[];

  role: UserRoles;
  createdAt: string;
  updatedAt: string;
}