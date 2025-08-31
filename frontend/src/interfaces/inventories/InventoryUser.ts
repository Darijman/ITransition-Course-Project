import { Inventory } from './Inventory';
import { InventoryComment } from './InventoryComment';
import { InventoryItem } from './InventoryItem';
import { InventoryUserRoles } from './InventoryUserRoles';
import { User } from '../users/User';

export interface InventoryUser {
  id: number;
  name: string;

  user?: User;
  userId: number;

  inventory?: Inventory;
  inventoryId: number;

  comments?: InventoryComment[];
  items?: InventoryItem[];

  role: InventoryUserRoles;
  createdAt: string;
  updatedAt: string;
}