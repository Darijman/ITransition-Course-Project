import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { InventoryStatuses } from '@/interfaces/inventories/Inventory';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import { InventoryItem } from '@/interfaces/inventories/InventoryItem';
import { InventoryComment } from '@/interfaces/inventories/InventoryComment';
import { InventoryItemLike } from '@/interfaces/inventories/InventoryItemLike';
import { InventoryInvite } from '@/interfaces/inventories/InventoryInvite';

export interface ServerToClientEvents {
  connect: () => void;

  'inventory-user-joined': (data: { inventoryId: number; inventoryUser: InventoryUser }) => void;
  'inventory-users-deleted': (data: { inventoryId: number; inventoryUserIds: number[]; deletedBy: string }) => void;
  'you-were-removed-from-inventory': (data: {
    inventoryId: number;
    inventoryName: string;
    inventoryStatus: InventoryStatuses;
    deletedBy: string;
  }) => void;
  'inventory-users-role-updated': (data: {
    inventoryId: number;
    updatedUserIds: number[];
    newRole: InventoryUserRoles;
    updatedBy: string;
  }) => void;
  'inventory-role-updated': (data: { inventoryId: number; newRole: InventoryUserRoles; updatedBy: string }) => void;

  'item-added': (data: { item: InventoryItem; addedBy: string }) => void;
  'items-deleted': (data: { itemIds: number[]; deletedBy: string }) => void;

  'inventory-comment-created': (comment: InventoryComment) => void;
  'inventory-comment-deleted': (data: { commentId: number }) => void;
  'inventory-comment-updated': (comment: InventoryComment) => void;

  'item-like-created': (like: InventoryItemLike) => void;
  'item-like-deleted': (data: { id: number }) => void;

  'inventory-status-updated': (data: { inventoryId: number; status: InventoryStatuses; updatedBy: string }) => void;

  'inventory-invite-created': (invite: InventoryInvite) => void;
  'inventory-invite-updated': (invite: InventoryInvite) => void;
  'inventory-invite-deleted': (data: { inviteId: number; inventoryId: number }) => void;
}

export interface ClientToServerEvents {
  'join-inventory': (data: { inventoryId: number; user: { id: number; name: string; role: InventoryUserRoles } | null }) => void;
}
