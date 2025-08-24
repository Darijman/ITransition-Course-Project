import { InventoryItem } from './InventoryItem';
import { InventoryUser } from './InventoryUser';

export interface InventoryItemLike {
  id: number;

  itemId: number;
  item?: InventoryItem;

  inventoryUserId: number;
  inventoryUser?: InventoryUser;

  createdAt: string;
  updatedAt: string;
}