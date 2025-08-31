import { Inventory } from './Inventory';
import { InventoryUser } from './InventoryUser';
import { InventoryUserRoles } from './InventoryUserRoles';

export enum InventoryInviteStatuses {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface InventoryInvite {
  id: number;
  inventoryId: number;
  inventory?: Inventory;
  inviteeEmail: string;
  inviteeInventoryUserId: number | null;
  inviter?: InventoryUser;
  inviterInventoryUserId: number;
  role: InventoryUserRoles;
  status: InventoryInviteStatuses;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}
