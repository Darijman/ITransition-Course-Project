'use client';

import { Button, Empty, Input, message, Spin, Table, Typography } from 'antd';
import { Select } from '@/components/select/Select';
import { useEffect, useMemo, useState } from 'react';
import { Inventory, InventoryStatuses } from '@/interfaces/inventories/Inventory';
import { useTranslations } from 'next-intl';
import { LogoutOutlined } from '@ant-design/icons';
import { columns } from './columns';
import { useAuth } from '@/contexts/authContext/AuthContext';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../../../../axiosConfig';
import './userInventories.css';

const { Title } = Typography;
const limit = 10;

export const UserInventories = () => {
  const { user } = useAuth();
  const t = useTranslations();

  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLeavingInventories, setIsLeavingInventories] = useState(false);

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [errorText, setErrorText] = useState('');

  const [offset, setOffset] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InventoryStatuses>('ALL');

  // === handlers ===
  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    setOffset(0);
    setInventories([]);
  };

  const handleStatusChange = (val: 'ALL' | InventoryStatuses) => {
    setStatusFilter(val);
    setOffset(0);
    setInventories([]);
  };

  // === fetch initial or filtered data ===
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

  // === load more ===
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

  // === filtered inventories for table search ===
  const filteredInventories = useMemo(() => {
    return inventories.filter((inventory) => {
      if (statusFilter !== 'ALL' && inventory.status !== statusFilter) return false;

      if (searchValue) {
        const lowerSearch = searchValue.toLowerCase();
        const matchesTitle = inventory.title?.toLowerCase().includes(lowerSearch);
        const matchesCreator = inventory.creator?.name?.toLowerCase().includes(lowerSearch);
        const matchesCategory = inventory.category?.title?.toLowerCase().includes(lowerSearch);
        const matchesTags = inventory.tags?.some((tag) => tag.title.toLowerCase().includes(lowerSearch));
        if (!matchesTitle && !matchesCreator && !matchesCategory && !matchesTags) return false;
      }

      return true;
    });
  }, [inventories, statusFilter, searchValue]);

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

            <Button
              className='user_inventories_leave_button'
              disabled={!selectedRowKeys.length}
              danger
              type='primary'
              icon={<LogoutOutlined style={{ fontSize: '20px' }} />}
              onClick={leaveManyInventoriesHandler}
              loading={isLeavingInventories}
            >
              Leave inventories
            </Button>

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
              columns={columns}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
                getCheckboxProps: (record) => ({
                  disabled: record.creator?.id === user?.id,
                }),
              }}
              dataSource={filteredInventories}
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
