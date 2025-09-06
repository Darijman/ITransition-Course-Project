'use client';

import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { MessageInstance } from 'antd/es/message/interface';

import { Inventory, InventoryStatuses } from '@/interfaces/inventories/Inventory';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import { InventoryItem } from '@/interfaces/inventories/InventoryItem';
import { InventoryComment } from '@/interfaces/inventories/InventoryComment';
import { InventoryItemLike } from '@/interfaces/inventories/InventoryItemLike';
import { InventoryInvite } from '@/interfaces/inventories/InventoryInvite';
import { ServerToClientEvents, ClientToServerEvents } from './events';

interface Props {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  inventory: Inventory | null;
  inventoryId: number;
  currentInventoryUser: InventoryUser | null;
  accessDenied: boolean;
  setInventory: Dispatch<SetStateAction<Inventory | null>>;
  messageApi: MessageInstance;
  router: AppRouterInstance;
  t: (key: string, params?: Record<string, any>) => string;
}

export const useInventorySocket = ({
  socket,
  inventory,
  inventoryId,
  currentInventoryUser,
  accessDenied,
  setInventory,
  messageApi,
  router,
  t,
}: Props) => {
  const lastCommentIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!inventoryId || !socket || accessDenied) return;

    const handleConnect = () => {
      socket.emit('join-inventory', {
        inventoryId,
        user: currentInventoryUser
          ? {
              id: currentInventoryUser.id,
              name: currentInventoryUser.name,
              role: currentInventoryUser.role,
            }
          : null,
      });
    };

    const handleUsersDeleted = (data: { inventoryId: number; inventoryUserIds: number[]; deletedBy: string }) => {
      if (data.inventoryId !== inventory?.id) return;

      setInventory((prev) =>
        prev ? { ...prev, inventoryUsers: prev.inventoryUsers?.filter((u) => !data.inventoryUserIds.includes(u.id)) } : prev,
      );
    };

    const handleUserJoined = (data: { inventoryId: number; inventoryUser: InventoryUser }) => {
      if (data.inventoryId !== inventory?.id) return;

      setInventory((prev) => {
        if (!prev) return prev;
        const exists = prev.inventoryUsers?.some((u) => u.id === data.inventoryUser.id);
        if (exists) return prev;

        return { ...prev, inventoryUsers: prev.inventoryUsers ? [...prev.inventoryUsers, data.inventoryUser] : [data.inventoryUser] };
      });
    };

    const handleUserRemoved = (data: {
      inventoryId: number;
      inventoryName: string;
      inventoryStatus: InventoryStatuses;
      deletedBy: string;
    }) => {
      if (data.inventoryStatus === InventoryStatuses.PRIVATE) {
        messageApi.info({
          content: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {t('inventory.info.removed_private', { name: data.deletedBy, inventory: data.inventoryName })}
            </div>
          ),
          onClose: () => router.push('/'),
          duration: 3,
        });
      } else {
        messageApi.info(t('inventory.info.removed_public', { name: data.deletedBy, inventory: data.inventoryName }));
      }
    };

    const handleUsersRoleUpdated = (data: {
      inventoryId: number;
      updatedUserIds: number[];
      newRole: InventoryUserRoles;
      updatedBy: string;
    }) => {
      if (data.inventoryId !== inventory?.id) return;

      setInventory((prev) =>
        prev
          ? {
              ...prev,
              inventoryUsers: prev.inventoryUsers?.map((u) => (data.updatedUserIds.includes(u.id) ? { ...u, role: data.newRole } : u)),
            }
          : prev,
      );
    };

    const handleRoleUpdated = (data: { inventoryId: number; newRole: InventoryUserRoles; updatedBy: string }) => {
      if (data.inventoryId !== inventory?.id) return;
      messageApi.info(t('inventory.info.your_role_updated', { role: t(`inventory.roles.${data.newRole}`), name: data.updatedBy }));
    };

    const handleItemAdded = (data: { item: InventoryItem; addedBy: string }) => {
      setInventory((prev) => (prev ? { ...prev, items: prev.items ? [data.item, ...prev.items] : [data.item] } : prev));
    };

    const handleItemsDeleted = (data: { itemIds: number[]; deletedBy: string }) => {
      setInventory((prev) => (prev ? { ...prev, items: prev.items?.filter((item) => !data.itemIds.includes(item.id)) } : prev));
    };

    const handleCommentCreated = (newComment: InventoryComment) => {
      lastCommentIdRef.current = newComment.id;
      setInventory((prev) => {
        if (!prev) return prev;
        if (prev.comments?.some((c) => c.id === newComment.id)) return prev;
        return { ...prev, comments: [...(prev.comments ?? []), newComment] };
      });
    };

    const handleCommentDeleted = ({ commentId }: { commentId: number }) => {
      setInventory((prev) => (prev ? { ...prev, comments: prev.comments?.filter((c) => c.id !== commentId) ?? [] } : prev));
    };

    const handleCommentUpdated = (updatedComment: InventoryComment) => {
      setInventory((prev) =>
        prev
          ? {
              ...prev,
              comments:
                prev.comments?.map((c) =>
                  c.id === updatedComment.id ? { ...c, text: updatedComment.text, updatedAt: updatedComment.updatedAt } : c,
                ) ?? [],
            }
          : prev,
      );
    };

    const handleItemLikeCreated = (like: InventoryItemLike) => {
      setInventory((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items?.map((item) =>
                item.id === like.itemId ? { ...item, likes: item.likes ? [...item.likes, like] : [like] } : item,
              ),
            }
          : prev,
      );
    };

    const handleItemLikeDeleted = ({ id }: { id: number }) => {
      setInventory((prev) =>
        prev ? { ...prev, items: prev.items?.map((item) => ({ ...item, likes: item.likes?.filter((like) => like.id !== id) ?? [] })) } : prev,
      );
    };

    const handleInventoryStatusUpdated = (data: { inventoryId: number; status: InventoryStatuses; updatedBy: string }) => {
      if (data.inventoryId === inventory?.id) {
        setInventory((prev) => (prev ? { ...prev, status: data.status } : prev));
        messageApi.info(t('inventory.access.status_updated', { status: data.status, updatedBy: data.updatedBy }));
      }
    };

    const handleInviteCreated = (newInvite: InventoryInvite) => {
      setInventory((prev) => {
        if (!prev) return prev;
        if (prev.invites?.some((inv) => inv.id === newInvite.id)) return prev;
        return { ...prev, invites: prev.invites ? [newInvite, ...prev.invites] : [newInvite] };
      });
    };

    const handleUpdatedInvite = (updated: InventoryInvite) => {
      setInventory((prev) =>
        prev ? { ...prev, invites: prev.invites?.map((inv) => (inv.id === updated.id ? { ...inv, status: updated.status } : inv)) } : prev,
      );
    };

    const handleInviteDeleted = (data: { inviteId: number; inventoryId: number }) => {
      if (data.inventoryId !== inventory?.id) return;
      setInventory((prev) => (prev ? { ...prev, invites: prev.invites?.filter((inv) => inv.id !== data.inviteId) } : prev));
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on('inventory-user-joined', handleUserJoined);
    socket.on('inventory-users-deleted', handleUsersDeleted);
    socket.on('you-were-removed-from-inventory', handleUserRemoved);
    socket.on('inventory-users-role-updated', handleUsersRoleUpdated);
    socket.on('inventory-role-updated', handleRoleUpdated);
    socket.on('item-added', handleItemAdded);
    socket.on('items-deleted', handleItemsDeleted);
    socket.on('inventory-comment-created', handleCommentCreated);
    socket.on('inventory-comment-deleted', handleCommentDeleted);
    socket.on('inventory-comment-updated', handleCommentUpdated);
    socket.on('item-like-created', handleItemLikeCreated);
    socket.on('item-like-deleted', handleItemLikeDeleted);
    socket.on('inventory-status-updated', handleInventoryStatusUpdated);
    socket.on('inventory-invite-updated', handleUpdatedInvite);
    socket.on('inventory-invite-created', handleInviteCreated);
    socket.on('inventory-invite-deleted', handleInviteDeleted);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('inventory-user-joined', handleUserJoined);
      socket.off('inventory-users-deleted', handleUsersDeleted);
      socket.off('you-were-removed-from-inventory', handleUserRemoved);
      socket.off('inventory-users-role-updated', handleUsersRoleUpdated);
      socket.off('inventory-role-updated', handleRoleUpdated);
      socket.off('item-added', handleItemAdded);
      socket.off('items-deleted', handleItemsDeleted);
      socket.off('inventory-comment-created', handleCommentCreated);
      socket.off('inventory-comment-deleted', handleCommentDeleted);
      socket.off('inventory-comment-updated', handleCommentUpdated);
      socket.off('item-like-created', handleItemLikeCreated);
      socket.off('item-like-deleted', handleItemLikeDeleted);
      socket.off('inventory-status-updated', handleInventoryStatusUpdated);
      socket.off('inventory-invite-updated', handleUpdatedInvite);
      socket.off('inventory-invite-created', handleInviteCreated);
      socket.off('inventory-invite-deleted', handleInviteDeleted);
    };
  }, [inventoryId, socket, accessDenied, currentInventoryUser, inventory?.id, messageApi, router, t, setInventory]);
};
