'use client';

import { useEffect, useMemo, useState } from 'react';
import { Table, Typography, Spin, Empty, message, Input, Button } from 'antd';
import { useTranslations } from 'next-intl';
import { Select } from '../select/Select';
import { InventoryStatuses } from '@/interfaces/Inventory';
import { ColumnsType } from 'antd/es/table';
import { MdBackpack } from 'react-icons/md';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../../axiosConfig';
import './inventoriesTable.css';

const { Title } = Typography;

const selectOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Public', value: 'PUBLIC' },
  { label: 'Private', value: 'PRIVATE' },
];

interface Query {
  offset?: number;
  limit?: number;
  status?: 'ALL' | InventoryStatuses;
  searchValue?: string;
}

interface InventoriesTableProps<T> {
  columns: ColumnsType<T>;
  rowKey: string | ((record: T) => string | number);
  title: string;
  pageLimit?: number;
  searchKeys: string[];
  showCreateButton?: boolean;
  onCreate?: () => void;
}

export const InventoriesTable = <T extends object>({
  columns,
  rowKey,
  title = 'Items',
  pageLimit = 20,
  searchKeys = [],
  showCreateButton = false,
  onCreate,
}: InventoriesTableProps<T>) => {
  const t = useTranslations();

  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  const [query, setQuery] = useState<Query>({
    offset: 0,
    limit: pageLimit,
    status: 'ALL',
    searchValue: '',
  });
  const [searchValue, setSearchValue] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InventoryStatuses>('ALL');

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);

      try {
        const { data } = await api.get(`/inventories/public`, { params: query });
        setItems(data);
        setHasMore(data.length === (query.limit ?? pageLimit));
        setQuery((prev) => ({ ...prev, offset: 0 }));
      } catch {
        messageApi.open({ type: 'error', content: 'Failed to load data!' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [messageApi, query, pageLimit]);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextOffset = (query.offset ?? 0) + (query.limit ?? pageLimit);
      const { data } = await api.get(`/inventories/public`, {
        params: { ...query, offset: nextOffset },
      });

      setItems((prev) => [...prev, ...data]);
      setHasMore(data.length === (query.limit ?? pageLimit));
      setQuery((prev) => ({ ...prev, offset: nextOffset }));
    } catch {
      messageApi.open({ type: 'error', content: 'Failed to load more data!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    setQuery((prev) => ({ ...prev, searchValue: val, offset: 0 }));
  };

  const handleStatusChange = (val: 'ALL' | InventoryStatuses) => {
    setStatusFilter(val);
    setQuery((prev) => ({ ...prev, status: val, offset: 0 }));
  };

  const getValueByPath = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => {
      if (!acc) return undefined;
      if (Array.isArray(acc)) {
        return acc
          .map((item) => item?.[part])
          .filter(Boolean)
          .join(', ');
      }
      return acc[part];
    }, obj);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== 'ALL') {
        const status = (item as any).status as InventoryStatuses;
        if (
          (statusFilter === 'PUBLIC' && status !== InventoryStatuses.PUBLIC) ||
          (statusFilter === 'PRIVATE' && status !== InventoryStatuses.PRIVATE)
        ) {
          return false;
        }
      }

      if (!searchValue) return true;

      return searchKeys.some((key) => {
        let val;
        if (key === 'status') {
          val = (item as any).status;
        } else {
          val = getValueByPath(item, key as string);
        }
        return val?.toString().toLowerCase().includes(searchValue.toLowerCase());
      });
    });
  }, [items, searchValue, searchKeys, statusFilter]);

  return (
    <div className='inventories_table'>
      {contextHolder}
      <div className='inventories_table_header'>
        <Title level={3} style={{ margin: 0 }}>
          {title}
        </Title>

        <Input.Search
          className='custom_search'
          style={{ width: 200 }}
          placeholder={t('home.inventories_table_search_placeholder')}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <Select
          options={selectOptions}
          placeholder='Select a status'
          value={statusFilter}
          style={{ width: 200 }}
          onChange={handleStatusChange}
        />

        {showCreateButton && onCreate && (
          <Button type='primary' icon={<MdBackpack />} onClick={onCreate}>
            {t('home.create_inventory_text')}
          </Button>
        )}
      </div>

      <div id='scrollable-table-body' style={{ height: 500, overflow: 'auto' }}>
        <InfiniteScroll
          dataLength={filteredItems.length}
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
            dataSource={filteredItems}
            rowKey={rowKey}
            pagination={false}
            locale={{
              emptyText: (
                <div style={{ textAlign: 'center' }}>
                  <Empty description={<span style={{ color: 'var(--red-color)' }}>No data</span>} />
                </div>
              ),
            }}
          />
        </InfiniteScroll>
      </div>
    </div>
  );
};
