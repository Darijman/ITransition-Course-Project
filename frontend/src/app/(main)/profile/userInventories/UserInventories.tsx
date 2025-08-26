'use client';

import { Empty, Input, message, Spin, Table, Typography } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Select } from '@/components/select/Select';
import { useEffect, useMemo, useState } from 'react';
import { Inventory, InventoryStatuses } from '@/interfaces/Inventory';
import { useTranslations } from 'next-intl';
import { columns } from './columns';
import api from '../../../../../axiosConfig';
import './userInventories.css';

const { Title } = Typography;

interface Query {
  offset?: number;
  limit?: number;
  status?: 'ALL' | InventoryStatuses;
  searchValue?: string;
}

export const UserInventories = () => {
  const t = useTranslations();

  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  const [searchValue, setSearchValue] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InventoryStatuses>('ALL');

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
        const { data } = await api.get(`/inventories/user`, { params: query });
        setInventories(data);
        setHasMore(data.length === (query.limit ?? 10));
        setQuery((prev) => ({ ...prev, offset: 0 }));
      } catch {
        messageApi.open({ type: 'error', content: 'Failed to load data!' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [messageApi, query]);

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
      messageApi.open({ type: 'error', content: 'Failed to load more data!' });
    } finally {
      setIsLoading(false);
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

  return (
    <div className='inventories_table'>
      {contextHolder}
      <div className='inventories_table_header'>
        <Title level={3} style={{ margin: 0 }}>
         {t('profile.user_inventories_title')}
        </Title>

        <Input.Search
          className='custom_search'
          style={{ width: 200 }}
          placeholder={t('home.inventories_table_search_placeholder')}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

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
