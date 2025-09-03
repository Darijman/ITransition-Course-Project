import { InventoryCategory } from './InventoryCategory';
import { InventoryComment } from './InventoryComment';
import { InventoryItem } from './InventoryItem';
import { InventoryTag } from './InventoryTag';
import { InventoryUser } from './InventoryUser';
import { User } from '../users/User';
import { InventoryInvite } from './InventoryInvite';

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
  invites?: InventoryInvite[];

  createdAt: string;
  updatedAt: string;
}