'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { InventoryItem } from '@/interfaces/InventoryItem';
import { inventoryItemsColumns } from './columns';
import { Button, Empty, Input, message, Spin, Table, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { IoIosAddCircle } from 'react-icons/io';
import { useParams } from 'next/navigation';
import { CreateItemModal } from './createItemModal/CreateItemModal';
import { InventoryUser } from '@/interfaces/InventoryUser';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../../../../../axiosConfig';
import './inventoryItems.css';
import { canModifyInventory } from '@/helpers/canModifyInventory';

const { Title } = Typography;
const limit: number = 10;

interface Props {
  currentInventoryUser: InventoryUser | null;
}

export const InventoryItems = ({ currentInventoryUser }: Props) => {
  const { user } = useAuth();
  const { inventoryId } = useParams();
  const t = useTranslations();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [searchValue, setSearchValue] = useState<string>('');
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });
  const [showCreateItemModal, setShowCreateItemModal] = useState<boolean>(false);

  const [offset, setOffset] = useState<number>(0);

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/inventory_items/inventory/${inventoryId}`, {
          params: { offset: 0, limit, searchValue },
        });
        setItems(data);
        setHasMore(data.length === limit);
        setOffset(0);
      } catch {
        messageApi.open({ type: 'error', content: 'Failed to load data!' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [inventoryId, searchValue, messageApi]);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextOffset = offset + limit;
      const { data } = await api.get(`/inventory_items/inventory/${inventoryId}`, {
        params: { offset: nextOffset, limit, searchValue },
      });

      setItems((prev) => [...prev, ...data]);
      setHasMore(data.length === limit);
      setOffset(nextOffset);
    } catch {
      messageApi.open({ type: 'error', content: 'Failed to load more data!' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchValue) return items;
    return items.filter((item) => item.title?.toLowerCase().includes(searchValue.toLowerCase()));
  }, [items, searchValue]);

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
        {t('inventory.items.title')}
      </Title>

      <div className='inventory_items_table'>
        {contextHolder}
        <div className='inventory_items_table_header'>
          <Title level={3} style={{ margin: 0 }}>
            {t('inventory.items.title')}
          </Title>

          <Input.Search
            className='custom_search'
            style={{ width: 200 }}
            placeholder={t('inventory.items.table_search_placeholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          {canModifyInventory(currentInventoryUser, user) ? (
            <Button onClick={() => setShowCreateItemModal(true)} type='primary' icon={<IoIosAddCircle style={{ fontSize: '20px' }} />}>
              {t('inventory.items.create_item')}
            </Button>
          ) : null}
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
              className='items_table'
              columns={inventoryItemsColumns}
              dataSource={filteredItems}
              rowKey='id'
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

      <CreateItemModal
        open={showCreateItemModal}
        onClose={() => setShowCreateItemModal(false)}
        currentInventoryUser={currentInventoryUser}
        setItems={setItems}
        inventoryId={inventoryId}
      />
    </div>
  );
};
