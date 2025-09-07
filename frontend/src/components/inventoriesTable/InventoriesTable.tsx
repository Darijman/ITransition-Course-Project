'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { Table, Typography, Spin, Empty, message, Input, Button } from 'antd';
import { useTranslations } from 'next-intl';
import { Select } from '../select/Select';
import { InventoryStatuses } from '@/interfaces/inventories/Inventory';
import { ColumnsType } from 'antd/es/table';
import { MdBackpack } from 'react-icons/md';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../../axiosConfig';
import './inventoriesTable.css';

const { Title } = Typography;
const limit: number = 10;

interface InventoriesTableProps<T> {
  columns: ColumnsType<T>;
  rowKey: string | ((record: T) => string | number);
  title: string;
  searchKeys: string[];
  onCreate: () => void;
}

export const InventoriesTable = <T extends object>({ columns, rowKey, title = 'Items', onCreate }: InventoriesTableProps<T>) => {
  const { user } = useAuth();
  const t = useTranslations();

  const [items, setItems] = useState<T[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  const [searchValue, setSearchValue] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InventoryStatuses>('ALL');
  const [errorText, setErrorText] = useState<string>('');

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    setOffset(0);
  };

  const handleStatusChange = (val: 'ALL' | InventoryStatuses) => {
    setStatusFilter(val);
    setOffset(0);
  };

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/inventories/public', {
          params: { status: statusFilter, searchValue, offset: 0, limit },
        });

        setItems(data);
        setHasMore(data.length === limit);
        setOffset(data.length);
        setErrorText('');
      } catch {
        setErrorText(t('home.inventories_table_failed_to_load'));
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [statusFilter, searchValue, t]);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const { data } = await api.get('/inventories/public', {
        params: { status: statusFilter, searchValue, offset, limit },
      });

      setItems((prev) => [...prev, ...data]);
      setHasMore(data.length === limit);
      setOffset((prev) => prev + data.length);
    } catch {
      messageApi.error(t('home.inventories_table_failed_to_load_more'));
    } finally {
      setIsLoading(false);
    }
  };

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
          options={[
            { label: t('home.select_status_all'), value: 'ALL' },
            { label: t('home.select_status_public'), value: 'PUBLIC' },
            { label: t('home.select_status_private'), value: 'PRIVATE' },
          ]}
          value={statusFilter}
          style={{ width: 200 }}
          onChange={handleStatusChange}
        />

        {user?.id ? (
          <Button type='primary' icon={<MdBackpack />} onClick={onCreate}>
            {t('home.create_inventory_text')}
          </Button>
        ) : null}
      </div>

      {errorText ? (
        <Title level={4} style={{ textAlign: 'center', color: 'var(--red-color)' }}>
          {errorText}
        </Title>
      ) : (
        <div id='scrollable-table-body' style={{ height: 500, overflow: 'auto' }}>
          <InfiniteScroll
            dataLength={items.length}
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
              dataSource={items}
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
      )}
    </div>
  );
};
