'use client';

import { useEffect } from 'react';
import { Inventory, InventoryStatuses } from '@/interfaces/inventories/Inventory';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import { Button, Space, Tooltip, Typography, message } from 'antd';
import { useTranslations } from 'next-intl';
import { useSocket } from '@/contexts/socketContext/SocketContext';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { UserRoles } from '@/interfaces/users/UserRoles.enum';
import api from '../../../../../../axiosConfig';
import './inventoryAccess.css';

const { Title } = Typography;

interface Props {
  currentInventoryUser: InventoryUser | null;
  inventory: Inventory | null;
  setInventory: React.Dispatch<React.SetStateAction<Inventory | null>>;
}

export const InventoryAccess = ({ currentInventoryUser, inventory, setInventory }: Props) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const t = useTranslations();

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  useEffect(() => {
    if (!socket || !inventory) return;

    const handleStatusUpdated = (data: { inventoryId: number; status: InventoryStatuses; updatedBy: string }) => {
      if (data.inventoryId === inventory.id) {
        setInventory((prev) => (prev ? { ...prev, status: data.status } : prev));
        messageApi.info(t('inventory.access.status_updated', { status: data.status, updatedBy: data.updatedBy }));
      }
    };

    socket.on('inventory-status-updated', handleStatusUpdated);

    return () => {
      socket.off('inventory-status-updated', handleStatusUpdated);
    };
  }, [socket, inventory, setInventory, messageApi, t]);

  const updateInventoryStatusHandler = async (newStatus: InventoryStatuses) => {
    if (!inventory) return;
    if (!(currentInventoryUser?.role === InventoryUserRoles.CREATOR || user.role === UserRoles.ADMIN)) return;

    try {
      await api.patch(`/inventories/${inventory.id}/status`, { status: newStatus });
    } catch {
      messageApi.error({ content: t('inventory.access.status_error') });
    }
  };

  return (
    <div>
      {contextHolder}

      <Title level={3} style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
        {t('inventory.access.title')}
      </Title>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Space.Compact>
          <Tooltip title={t('inventories_new.status_tooltip_private')}>
            <Button
              className='inventory_status_button'
              type={inventory?.status === InventoryStatuses.PRIVATE ? 'primary' : 'default'}
              disabled={inventory?.status === InventoryStatuses.PRIVATE}
              style={{
                maxWidth: '250px',
                width: '100%',
                color: inventory?.status === InventoryStatuses.PRIVATE ? '#FFFFFF' : 'black',
              }}
              onClick={() => updateInventoryStatusHandler(InventoryStatuses.PRIVATE)}
            >
              {t('inventories_new.private')}
            </Button>
          </Tooltip>
          <Tooltip title={t('inventories_new.status_tooltip_public')}>
            <Button
              className='inventory_status_button'
              type={inventory?.status === InventoryStatuses.PUBLIC ? 'primary' : 'default'}
              disabled={inventory?.status === InventoryStatuses.PUBLIC}
              style={{
                maxWidth: '250px',
                width: '100%',
                color: inventory?.status === InventoryStatuses.PUBLIC ? '#FFFFFF' : 'black',
              }}
              onClick={() => updateInventoryStatusHandler(InventoryStatuses.PUBLIC)}
            >
              {t('inventories_new.public')}
            </Button>
          </Tooltip>
        </Space.Compact>
      </div>
    </div>
  );
};
