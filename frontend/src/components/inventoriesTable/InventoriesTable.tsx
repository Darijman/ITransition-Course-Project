'use client';

import { useEffect, useMemo, useState } from 'react';
import { Table, Typography, Spin, Empty, message, Input, Button } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FileAddOutlined } from '@ant-design/icons';
import './inventoriesTable.css';
import { useTranslations } from 'next-intl';
import { Select } from '../select/Select';

const { Title } = Typography;

const selectOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Public', value: 'PUBLIC' },
  { label: 'Private', value: 'PRIVATE' },
];

interface InventoriesTableProps<T> {
  data: T[]; // массив данных
  getData?: (offset: number, limit: number) => Promise<T[]>; // функция для подгрузки
  columns: any[]; // колонки таблицы
  rowKey: string | ((record: T) => string | number); // ключ строки
  title?: string; // заголовок таблицы
  pageLimit?: number;
  searchKeys?: string[];
  showCreateButton?: boolean;
  onCreate?: () => void;
}

export const InventoriesTable = <T extends object>({
  data,
  getData,
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
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  const [searchValue, setSearchValue] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');

  useEffect(() => {
    const fetchInitial = async () => {
      if (!getData) {
        setItems(data);
        setHasMore(false);
        return;
      }

      setIsLoading(true);
      try {
        const initial = await getData(0, pageLimit);
        setItems(initial);
        setHasMore(initial.length === pageLimit);
        setOffset(0);
      } catch {
        messageApi.open({ type: 'error', content: 'Failed to load data!' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [data, getData, messageApi, pageLimit]);

  const loadMore = async () => {
    if (isLoading || !hasMore || !getData) return;
    setIsLoading(true);

    try {
      const nextOffset = offset + items.length;
      const newItems = await getData(nextOffset, pageLimit);
      setItems((prev) => [...prev, ...newItems]);
      setHasMore(newItems.length === pageLimit);
      setOffset(nextOffset);
    } catch {
      messageApi.open({ type: 'error', content: 'Failed to load more data!' });
    } finally {
      setIsLoading(false);
    }
  };

  const getValueByPath = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => {
      if (!acc) return undefined;
      if (Array.isArray(acc)) {
        // для массивов собираем все значения
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
      // Фильтр по статусу
      if (statusFilter !== 'ALL') {
        const isPublic = (item as any).isPublic;
        if ((statusFilter === 'PUBLIC' && !isPublic) || (statusFilter === 'PRIVATE' && isPublic)) {
          return false;
        }
      }

      // Фильтр по поиску
      if (!searchValue) return true;

      return searchKeys.some((key) => {
        let val;
        if (key === 'status') {
          val = (item as any).isPublic ? 'Public' : 'Private';
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
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <Select
          options={selectOptions}
          placeholder='Select a status'
          value={statusFilter}
          style={{ width: 200 }}
          onChange={(value) => {
            setStatusFilter(value);
          }}
        />

        {showCreateButton && onCreate && (
          <Button type='primary' icon={<FileAddOutlined />} onClick={onCreate}>
            Create
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
