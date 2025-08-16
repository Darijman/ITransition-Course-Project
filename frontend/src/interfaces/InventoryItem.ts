import { Inventory } from './Inventory';
import { InventoryItemLike } from './InventoryItemLike';
import { InventoryUser } from './InventoryUser';

export interface InventoryItem {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;

  inventoryId: number;
  inventory?: Inventory;

  creatorId: number;
  creator?: InventoryUser;

  likes?: InventoryItemLike[];

  createdAt: string;
  updatedAt: string;
}