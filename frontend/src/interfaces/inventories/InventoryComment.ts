import { Inventory } from './Inventory';
import { InventoryUser } from './InventoryUser';

export interface InventoryComment {
  id: number;
  text: string;

  inventoryId: number;
  inventory?: Inventory;

  authorId: number;
  author?: InventoryUser;
  
  createdAt: string;
  updatedAt: string;
}