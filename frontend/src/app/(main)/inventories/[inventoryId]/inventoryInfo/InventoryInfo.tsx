'use client';

import { Inventory, InventoryStatuses } from '@/interfaces/inventories/Inventory';
import { Button, Empty, Input, message, Spin, Table, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { getInventoryUsersColumns } from './columns';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { DeleteOutlined } from '@ant-design/icons';
import { UserRoles } from '@/interfaces/users/UserRoles.enum';
import { useSocket } from '@/contexts/socketContext/SocketContext';
import { useRouter } from 'next/navigation';
import api from '../../../../../../axiosConfig';
import './inventoryInfo.css';

const { Title, Paragraph } = Typography;

// Make sure Creator is always first
const sortUsers = (users: InventoryUser[]) => {
  const creators = users.filter((u) => u.role === InventoryUserRoles.CREATOR);
  const others = users.filter((u) => u.role !== InventoryUserRoles.CREATOR);
  return [...creators, ...others];
};

interface Props {
  inventory: Inventory | null;
  setInventory: React.Dispatch<React.SetStateAction<Inventory | null>>;
  currentInventoryUser: InventoryUser | null;
}

export const InventoryInfo = ({ inventory, setInventory, currentInventoryUser }: Props) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isDeletingUsers, setIsDeletingUsers] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  const canModify: boolean = currentInventoryUser?.role === InventoryUserRoles.CREATOR || user.role === UserRoles.ADMIN;

  useEffect(() => {
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

    socket.on('inventory-users-deleted', handleUsersDeleted);
    socket.on('you-were-removed-from-inventory', handleRemoved);

    return () => {
      socket.off('inventory-users-deleted', handleUsersDeleted);
      socket.off('you-were-removed-from-inventory', handleRemoved);
    };
  }, [socket, inventory, t, messageApi, router, setInventory]);

  const deleteInventoryUsersHandler = async () => {
    if (!canModify || !inventory) return;

    setIsDeletingUsers(true);
    try {
      await api.delete(`/inventory_users/${inventory.id}`, { data: { inventoryUserIds: selectedRowKeys } });
      setSelectedRowKeys([]);

      messageApi.info({
        content: t('inventory.info.users_deleted_successfully'),
      });
    } catch {
      messageApi.error({
        content: t('inventory.info.failed_to_delete_users'),
      });
    } finally {
      setIsDeletingUsers(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const users = inventory?.inventoryUsers ?? [];
    if (!searchValue) return sortUsers(users);

    const search = searchValue.toLowerCase();
    const filtered = users.filter((user) => user.name?.toLowerCase().includes(search) || user.role?.toLowerCase().includes(search));

    return sortUsers(filtered);
  }, [inventory?.inventoryUsers, searchValue]);

  return (
    <div>
      {contextHolder}

      <Title level={3} style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
        {t('inventory.info.title')}
      </Title>

      <div>
        <div className='inventory_info_description'>
          <Title level={3} style={{ margin: '0 0 10px 0' }}>
            {t('inventory.info.description')}
          </Title>
          <Paragraph>{inventory?.description}</Paragraph>
        </div>

        <div className='inventory_info_users_table'>
          <div className='inventory_info_users_table_header'>
            <Title level={3} style={{ margin: 0 }}>
              {t('inventory.info.table_title')}
            </Title>

            {canModify ? (
              <Button
                className='inventory_info_delete_users_button'
                disabled={!selectedRowKeys.length}
                type='primary'
                onClick={deleteInventoryUsersHandler}
                danger
                icon={<DeleteOutlined style={{ fontSize: '20px' }} />}
                loading={isDeletingUsers}
              >
                {t('inventory.info.delete_users')}
              </Button>
            ) : null}

            <Input.Search
              className='custom_search'
              style={{ width: 200 }}
              placeholder={t('inventory.info.table_search_placeholder')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <Table
            className='inventory_users_table'
            columns={getInventoryUsersColumns(t, user)}
            dataSource={filteredUsers}
            rowKey='id'
            pagination={false}
            rowSelection={
              currentInventoryUser?.role === InventoryUserRoles.CREATOR || user?.role === UserRoles.ADMIN
                ? {
                    type: 'checkbox',
                    onChange: (keys) => setSelectedRowKeys(keys),
                    getCheckboxProps: (record) => ({
                      disabled: record.role === InventoryUserRoles.CREATOR,
                    }),
                  }
                : undefined
            }
            scroll={{ y: 600 }}
            locale={{
              emptyText: (
                <div style={{ textAlign: 'center' }}>
                  <Empty description={<span style={{ color: 'var(--red-color)' }}>{t('inventory.info.no_users')}</span>} />
                </div>
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
};
