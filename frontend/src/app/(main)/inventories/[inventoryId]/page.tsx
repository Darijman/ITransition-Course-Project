'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { message, Spin, Typography, Tabs, Tag } from 'antd';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Inventory, InventoryStatuses } from '@/interfaces/inventories/Inventory';
import { Loader } from '@/ui/loader/Loader';
import { getTabs } from './tabs';
import { useSocket } from '@/contexts/socketContext/SocketContext';
import { InventoryComment } from '@/interfaces/inventories/InventoryComment';
import { InventoryItem } from '@/interfaces/inventories/InventoryItem';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import api from '../../../../../axiosConfig';

const { Title } = Typography;

const InventoryPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const t = useTranslations();
  const router = useRouter();

  const { inventoryId } = useParams();

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const lastCommentIdRef = useRef<number | null>(null);

  const getInventory = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data: Inventory } = await api.get<Inventory>(`/inventories/${inventoryId}`);
      setInventory(Inventory);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setAccessDenied(true);

        messageApi.error({
          key: 'access_denied',
          content: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              You do not have access! Taking you to the home page..
              <Spin size='default' />
            </div>
          ),
          onClose: () => router.push('/'),
          duration: 3,
        });
      } else {
        messageApi.error({ content: t('inventory.failed_to_get') });
      }
    } finally {
      setIsLoading(false);
    }
  }, [inventoryId, t, messageApi, router]);

  useEffect(() => {
    getInventory();
  }, [getInventory]);

  const currentInventoryUser = useMemo(() => {
    if (!inventory || !user) return null;
    return inventory?.inventoryUsers?.find((invUser) => invUser.userId === user.id) || null;
  }, [inventory, user]);

  useEffect(() => {
    if (!inventoryId || !socket || accessDenied) return;

    const handleConnect = () => {
      socket.emit('join-inventory', {
        inventoryId,
        user: { id: currentInventoryUser?.id, name: currentInventoryUser?.name, role: currentInventoryUser?.role },
      });
      socket.emit('get-users', { inventoryId });
    };

    if (!socket || !inventory?.id) return;

    const handleUsersDeleted = (data: { inventoryId: number; deletedUserIds: number[]; deletedBy: string }) => {
      if (data.inventoryId !== inventory.id) return;

      setInventory((prev) =>
        prev
          ? {
              ...prev,
              inventoryUsers: prev.inventoryUsers?.filter((u) => !data.deletedUserIds.includes(u.id)),
            }
          : prev,
      );
    };

    const handleRemoved = (data: { inventoryId: number; inventoryName: string; inventoryStatus: InventoryStatuses; deletedBy: string }) => {
      if (data.inventoryStatus === InventoryStatuses.PRIVATE) {
        messageApi.info({
          content: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {t('inventory.info.removed_private', {
                name: data.deletedBy,
                inventory: data.inventoryName,
              })}
              <Spin size='default' />
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
      if (data.inventoryId !== inventory.id) return;

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
      if (data.inventoryId !== inventory.id) return;

      messageApi.info(
        t('inventory.info.your_role_updated', {
          role: t(`inventory.roles.${data.newRole}`),
          name: data.updatedBy,
        }),
      );
    };

    const handleItemAdded = (data: { item: InventoryItem; addedBy: string }) => {
      setInventory((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items ? [data.item, ...prev.items] : [data.item],
            }
          : prev,
      );
    };

    const handleItemsDeleted = (data: { itemIds: number[]; deletedBy: string }) => {
      setInventory((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items?.filter((item) => !data.itemIds.includes(item.id)),
            }
          : prev,
      );
    };

    const handleCommentCreated = (newComment: InventoryComment) => {
      lastCommentIdRef.current = newComment.id;

      setInventory((prev) => {
        if (!prev) return prev;

        if (prev.comments?.some((c) => c.id === newComment.id)) {
          return prev;
        }

        return {
          ...prev,
          comments: [...(prev.comments ?? []), newComment],
        };
      });
    };

    const handleCommentDeleted = ({ commentId }: { commentId: number }) => {
      setInventory((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          comments: prev.comments?.filter((c) => c.id !== commentId) ?? [],
        };
      });
    };

    const handleCommentUpdated = (updatedComment: InventoryComment) => {
      setInventory((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          comments:
            prev.comments?.map((c) =>
              c.id === updatedComment.id ? { ...c, text: updatedComment.text, updatedAt: updatedComment.updatedAt } : c,
            ) ?? [],
        };
      });
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);

    socket.on('inventory-users-deleted', handleUsersDeleted);
    socket.on('you-were-removed-from-inventory', handleRemoved);
    socket.on('inventory-users-role-updated', handleUsersRoleUpdated);
    socket.on('inventory-role-updated', handleRoleUpdated);
    socket.on('item-added', handleItemAdded);
    socket.on('items-deleted', handleItemsDeleted);
    socket.on('inventory-comment-created', handleCommentCreated);
    socket.on('inventory-comment-deleted', handleCommentDeleted);
    socket.on('inventory-comment-updated', handleCommentUpdated);

    return () => {
      socket.off('connect', handleConnect);

      socket.off('inventory-users-deleted', handleUsersDeleted);
      socket.off('you-were-removed-from-inventory', handleRemoved);
      socket.off('inventory-users-role-updated', handleUsersRoleUpdated);
      socket.off('inventory-role-updated', handleRoleUpdated);
      socket.off('item-added', handleItemAdded);
      socket.off('items-deleted', handleItemsDeleted);
      socket.off('inventory-comment-created', handleCommentCreated);
      socket.off('inventory-comment-deleted', handleCommentDeleted);
      socket.off('inventory-comment-updated', handleCommentUpdated);
    };
  }, [inventoryId, socket, accessDenied, currentInventoryUser, inventory?.id, messageApi, router, t]);

  const statusText =
    inventory?.status === InventoryStatuses.PUBLIC
      ? t('inventories_new.public')
      : inventory?.status === InventoryStatuses.PRIVATE
        ? t('inventories_new.private')
        : inventory?.status;

  return (
    <div>
      {contextHolder}

      {accessDenied ? null : (
        <>
          <div style={{ textAlign: 'center', margin: '0px 0px 20px 0px' }}>
            <Title level={1} style={{ margin: 0 }}>
              {inventory?.title} <Tag color='var(--status-color)'> {statusText}</Tag>
            </Title>
          </div>

          {isLoading ? (
            <Loader />
          ) : (
            <Tabs
              destroyOnHidden
              defaultActiveKey='1'
              items={getTabs(currentInventoryUser, inventory, setInventory, user.role, lastCommentIdRef, t)}
              tabBarGutter={25}
            />
          )}
        </>
      )}
    </div>
  );
};

export default InventoryPage;
