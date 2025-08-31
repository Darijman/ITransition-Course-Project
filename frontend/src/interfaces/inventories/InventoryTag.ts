import { Inventory } from './Inventory';

export interface InventoryTag {
  id: number;
  title: string;
  description?: string;
  inventories?: Inventory[];

  createdAt: string;
  updatedAt: string;
}