import { InventoryCategory } from './InventoryCategory';
import { InventoryComment } from './InventoryComment';
import { InventoryItem } from './InventoryItem';
import { InventoryTag } from './InventoryTag';
import { InventoryUser } from './InventoryUser';
import { User } from './User';

export enum InventoryStatuses {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export interface Inventory {
  id: number;
  status: InventoryStatuses;
  title: string;
  description?: string;
  imageUrl: string;

  category?: InventoryCategory;
  categoryId: number;

  creator?: User;
  creatorId: number;

  comments?: InventoryComment[];
  items?: InventoryItem[];
  tags?: InventoryTag[];
  inventoryUsers?: InventoryUser[];

  createdAt: string;
  updatedAt: string;
}