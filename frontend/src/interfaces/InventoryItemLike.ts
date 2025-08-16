import { InventoryItem } from './InventoryItem';
import { InventoryUser } from './InventoryUser';

export interface InventoryItemLike {
  id: number;

  itemId: number;
  item?: InventoryItem;

  userId: number;
  user?: InventoryUser;

  createdAt: string;
  updatedAt: string;
}