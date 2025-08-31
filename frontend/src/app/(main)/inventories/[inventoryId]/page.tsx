'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { message, Spin, Typography, Tabs, Tag } from 'antd';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Inventory } from '@/interfaces/inventories/Inventory';
import { Loader } from '@/ui/loader/Loader';
import { getTabs } from './tabs';
import api from '../../../../../axiosConfig';
import './inventory.css';
import { useSocket } from '@/contexts/socketContext/SocketContext';

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
      console.log(`socket connected!`);
    };

    socket.on('connect', handleConnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [inventoryId, socket, accessDenied, currentInventoryUser]);

  console.log(`inventory`, inventory);
  

  return (
    <div>
      {contextHolder}

      {accessDenied ? null : (
        <>
          <div style={{ textAlign: 'center', margin: '0px 0px 20px 0px' }}>
            <Title level={1} style={{ margin: 0 }}>
              {inventory?.title} <Tag color='var(--status-color)'> {inventory?.status}</Tag>
            </Title>
          </div>

          {isLoading ? (
            <Loader />
          ) : (
            <Tabs defaultActiveKey='1' items={getTabs(currentInventoryUser, inventory, setInventory, user.role, t)} tabBarGutter={25} />
          )}
        </>
      )}
    </div>
  );
};

export default InventoryPage;
