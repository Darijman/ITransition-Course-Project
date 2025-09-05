'use client';

import { Button, Empty, Input, message, Spin, Table, Tooltip, Typography } from 'antd';
import { Select } from '@/components/select/Select';
import { useEffect, useState } from 'react';
import { InventoryStatuses } from '@/interfaces/inventories/Inventory';
import { useTranslations } from 'next-intl';
import { LogoutOutlined } from '@ant-design/icons';
import { getColumns, ExtendedInventory } from './columns';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { useSocket } from '@/contexts/socketContext/SocketContext';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../../../../axiosConfig';
import './userInventories.css';

const { Title } = Typography;
const limit: number = 10;

export const UserInventories = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const t = useTranslations();

  const [inventories, setInventories] = useState<ExtendedInventory[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLeavingInventories, setIsLeavingInventories] = useState<boolean>(false);

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [errorText, setErrorText] = useState<string>('');

  const [offset, setOffset] = useState<number>(0);
  const [searchValue, setSearchValue] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InventoryStatuses>('ALL');

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    setOffset(0);
  };

  const handleStatusChange = (val: 'ALL' | InventoryStatuses) => {
    setStatusFilter(val);
    setOffset(0);
  };

  useEffect(() => {
    if (!socket || !user?.email) return;

    const handleInventoryJoined = (inventory: ExtendedInventory) => {
      setInventories((prev) => [inventory, ...prev]);
    };

    socket.on('inventory-joined', handleInventoryJoined);

    return () => {
      socket.off('inventory-joined', handleInventoryJoined);
    };
  }, [socket, user?.email]);

  useEffect(() => {
    if (!user.id) return;

    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/inventories/user/${user.id}`, {
          params: { offset: 0, limit, status: statusFilter, searchValue },
        });
        setInventories(data);
        setHasMore(data.length === limit);
        setOffset(data.length);
      } catch {
        setErrorText(t('profile.user_inventories.failed_to_load'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [user.id, statusFilter, searchValue, t]);

  const loadMore = async () => {
    if (isLoading || !hasMore || !user.id) return;

    setIsLoading(true);
    try {
      const { data } = await api.get(`/inventories/user/${user.id}`, {
        params: { offset, limit, status: statusFilter, searchValue },
      });
      setInventories((prev) => [...prev, ...data]);
      setHasMore(data.length === limit);
      setOffset((prev) => prev + data.length);
    } catch {
      messageApi.error(t('profile.user_inventories.failed_to_load_more'));
    } finally {
      setIsLoading(false);
    }
  };

  const leaveManyInventoriesHandler = async () => {
    if (!user.id || !selectedRowKeys.length) return;
    setIsLeavingInventories(true);

    try {
      await api.post('/inventory_users/leave', { inventoryIds: selectedRowKeys });
      messageApi.success(t('profile.user_inventories.successfully_left_inventories'));

      setInventories((prev) => prev.filter((inv) => !selectedRowKeys.includes(inv.id)));
      setSelectedRowKeys([]);
    } catch {
      messageApi.error(t('profile.user_inventories.failed_to_leave_inventories'));
    } finally {
      setIsLeavingInventories(false);
    }
  };

  return (
    <div className='inventories_table'>
      {contextHolder}
      <div className='inventories_table_header'>
        <Title level={3} style={{ margin: 0 }}>
          {t('profile.user_inventories.title')}
        </Title>

        {errorText ? null : (
          <>
            <Input.Search
              className='custom_search'
              style={{ width: 200 }}
              placeholder={t('home.inventories_table_search_placeholder')}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
            />

            <Tooltip mouseEnterDelay={1} title={t('profile.user_inventories.leave_inventories_tooltip')}>
              <Button
                className='user_inventories_leave_button'
                disabled={!selectedRowKeys.length}
                danger
                type='primary'
                icon={<LogoutOutlined style={{ fontSize: '20px' }} />}
                onClick={leaveManyInventoriesHandler}
                loading={isLeavingInventories}
              >
                {t('profile.user_inventories.leave_inventories')}
              </Button>
            </Tooltip>

            <Select
              options={[
                { label: t('home.select_status_all'), value: 'ALL' },
                { label: t('home.select_status_public'), value: 'PUBLIC' },
                { label: t('home.select_status_private'), value: 'PRIVATE' },
              ]}
              placeholder='Select a status'
              value={statusFilter}
              style={{ width: 200 }}
              onChange={handleStatusChange}
            />
          </>
        )}
      </div>

      {errorText ? (
        <Title level={4} style={{ textAlign: 'center', color: 'var(--red-color)' }}>
          {errorText}
        </Title>
      ) : (
        <div id='user_inventories' style={{ height: 500, overflow: 'auto' }}>
          <InfiniteScroll
            dataLength={inventories.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Spin size='large' />
              </div>
            }
            scrollableTarget='user_inventories'
            scrollThreshold='100px'
          >
            <Table
              className='table'
              columns={getColumns(t, user)}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
                getCheckboxProps: (record) => ({
                  disabled: record.creator?.id === user?.id,
                }),
              }}
              dataSource={inventories}
              rowKey='id'
              pagination={false}
              locale={{
                emptyText: (
                  <div style={{ textAlign: 'center' }}>
                    <Empty description={<span style={{ color: 'var(--red-color)' }}>No inventories</span>} />
                  </div>
                ),
              }}
            />
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
};
