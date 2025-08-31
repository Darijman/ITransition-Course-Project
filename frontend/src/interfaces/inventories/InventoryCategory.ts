import { Inventory } from './Inventory';

export interface InventoryCategory {
  id: number;
  title: string;
  description?: string;
  inventories?: Inventory[];
  createdAt: string;
  updatedAt: string;
}