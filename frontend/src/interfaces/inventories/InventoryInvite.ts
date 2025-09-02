import { Inventory } from './Inventory';
import { InventoryUser } from './InventoryUser';
import { InventoryUserRoles } from './InventoryUserRoles';
import { User } from '../users/User';

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

  inviterInventoryUserId: number;
  inviter?: InventoryUser;

  inviteeInventoryUserId: number | null;
  invitee?: InventoryUser | null;

  inviteeUserId?: number | null;
  inviteeUser?: User | null;

  inviteeEmail: string;

  role: InventoryUserRoles;
  status: InventoryInviteStatuses;

  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}
