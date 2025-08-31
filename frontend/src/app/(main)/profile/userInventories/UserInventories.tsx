'use client';

import { Button, Empty, Input, message, Spin, Table, Typography } from 'antd';
import { Select } from '@/components/select/Select';
import { useEffect, useMemo, useState } from 'react';
import { Inventory, InventoryStatuses } from '@/interfaces/inventories/Inventory';
import { useTranslations } from 'next-intl';
import { LogoutOutlined } from '@ant-design/icons';
import { columns } from './columns';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../../../../axiosConfig';
import './userInventories.css';
import { useAuth } from '@/contexts/authContext/AuthContext';

const { Title } = Typography;

interface Query {
  offset?: number;
  limit?: number;
  status?: 'ALL' | InventoryStatuses;
  searchValue?: string;
}

export const UserInventories = () => {
  const { user } = useAuth();
  const t = useTranslations();

  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLeavingInventories, setIsLeavingInventories] = useState<boolean>(false);

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [searchValue, setSearchValue] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InventoryStatuses>('ALL');
  const [errorText, setErrorText] = useState<string>('');

  const [query, setQuery] = useState<Query>({
    offset: 0,
    limit: 10,
    status: 'ALL',
    searchValue: '',
  });

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    setQuery((prev) => ({ ...prev, searchValue: val, offset: 0 }));
  };

  const handleStatusChange = (val: 'ALL' | InventoryStatuses) => {
    setStatusFilter(val);
    setQuery((prev) => ({ ...prev, status: val, offset: 0 }));
  };

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/inventories/user`, { params: { ...query, offset: 0 } });
        setInventories(data);
        setHasMore(data.length === (query.limit ?? 10));
      } catch {
        setErrorText(t('profile.user_inventories.failed_to_load'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [query, t]);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextOffset = (query.offset ?? 0) + (query.limit ?? 10);
      const { data } = await api.get(`/inventories/user`, {
        params: { ...query, offset: nextOffset },
      });

      setInventories((prev) => [...prev, ...data]);
      setHasMore(data.length === (query.limit ?? 10));
      setQuery((prev) => ({ ...prev, offset: nextOffset }));
    } catch {
      setErrorText(t('profile.user_inventories.failed_to_load'));
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
      messageApi.success(t('profile.user_inventories.failed_to_leave_inventories'));
    } finally {
      setIsLeavingInventories(false);
    }
  };

  const filteredInventories = useMemo(() => {
    return inventories.filter((inventory) => {
      if (statusFilter !== 'ALL') {
        if (
          (statusFilter === 'PUBLIC' && inventory.status !== InventoryStatuses.PUBLIC) ||
          (statusFilter === 'PRIVATE' && inventory.status !== InventoryStatuses.PRIVATE)
        ) {
          return false;
        }
      }

      if (searchValue) {
        const lowerSearch = searchValue.toLowerCase();
        const matchesTitle = inventory.title?.toLowerCase().includes(lowerSearch);
        const matchesCreator = inventory.creator?.name?.toLowerCase().includes(lowerSearch);
        const matchesCategory = inventory.category?.title?.toLowerCase().includes(lowerSearch);
        const matchesTags = inventory.tags?.some((tag) => tag.title.toLowerCase().includes(lowerSearch));

        if (!matchesTitle && !matchesCreator && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [inventories, statusFilter, searchValue]);

  console.log(`selectedRowkKeys`, selectedRowKeys);

  return (
    <div className='inventories_table'>
      {contextHolder}
      <div className='inventories_table_header'>
        <Title level={3} style={{ margin: 0 }}>
          {t('profile.user_inventories.title')}
        </Title>

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
      </div>

      <div id='scrollable-table-body' style={{ height: 500, overflow: 'auto' }}>
        <InfiniteScroll
          dataLength={filteredInventories.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Spin size='large' />
            </div>
          }
          scrollableTarget='scrollable-table-body'
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
    </div>
  );
};
