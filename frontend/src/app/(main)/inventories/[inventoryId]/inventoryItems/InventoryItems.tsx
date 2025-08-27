'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { InventoryItem } from '@/interfaces/InventoryItem';
import { getInventoryItemsColumns } from './columns';
import { Button, Empty, Input, message, Popconfirm, Spin, Table, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { IoIosAddCircle } from 'react-icons/io';
import { useParams } from 'next/navigation';
import { CreateItemModal } from './createItemModal/CreateItemModal';
import { InventoryUser } from '@/interfaces/InventoryUser';
import { canModifyInventory } from '@/helpers/canModifyInventory';
import { LikesListModal } from './likesListModal/LikesListModal';
import { InventoryItemLike } from '@/interfaces/InventoryItemLike';
import { useLocale } from '@/contexts/localeContext/LocaleContext';
import { useSocket } from '@/contexts/socketContext/SocketContext';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../../../../../axiosConfig';
import './inventoryItems.css';

const { Title } = Typography;
const limit: number = 10;

interface Props {
  currentInventoryUser: InventoryUser | null;
}

export const InventoryItems = ({ currentInventoryUser }: Props) => {
  const { user } = useAuth();
  const { inventoryId } = useParams();
  const { locale } = useLocale();
  const { socket } = useSocket();
  const t = useTranslations();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [searchValue, setSearchValue] = useState<string>('');
  const [offset, setOffset] = useState<number>(0);
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  const [showCreateItemModal, setShowCreateItemModal] = useState<boolean>(false);
  const [showLikesListModal, setShowLikesListModal] = useState<boolean>(false);
  const [selectedLikes, setSelectedLikes] = useState<InventoryItemLike[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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

  useEffect(() => {
    if (!socket || !inventoryId) return;

    const handleItemAdded = (data: { item: InventoryItem; addedBy: string }) => {
      setItems((prevItems) => {
        const exists = prevItems.some((i) => i.id === data.item.id);
        if (exists) return prevItems;
        return [data.item, ...prevItems];
      });
    };

    const handleItemsDeleted = (data: { itemIds: number[]; deletedBy: string }) => {
      setItems((prevItems) => prevItems.filter((item) => !data.itemIds.includes(item.id)));
    };

    socket.on('item-added', handleItemAdded);
    socket.on('items-deleted', handleItemsDeleted);

    return () => {
      socket.off('item-added', handleItemAdded);
      socket.off('items-deleted', handleItemsDeleted);
    };
  }, [socket, inventoryId]);

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

  const handleOpenLikesModal = (likes: InventoryItemLike[]) => {
    setSelectedLikes(likes);
    setShowLikesListModal(true);
  };

  const handleToggleLike = async (itemId: number, likeId?: number) => {
    if (!canModifyInventory(currentInventoryUser, user)) return;
    const action: 'like' | 'unlike' = likeId ? 'unlike' : 'like';

    try {
      if (likeId) {
        await api.delete(`/inventory_item_likes/${likeId}`);
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, likes: (item.likes ?? []).filter((like) => like.id !== likeId) } : item)),
        );
      } else {
        const { data } = await api.post(`/inventory_item_likes`, { itemId });
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  likes: [...(item.likes ?? []), data],
                }
              : item,
          ),
        );
      }
    } catch {
      messageApi.error({
        content: action === 'like' ? t('inventory.items.like_failed') : t('inventory.items.unlike_failed'),
      });
    }
  };

  const deleteManyItemsHandler = async () => {
    if (!canModifyInventory(currentInventoryUser, user) || !selectedRowKeys.length) return;

    try {
      await api.delete(`/inventory_items`, {
        data: { itemIds: selectedRowKeys },
      });

      setSelectedRowKeys([]);
      messageApi.success(t('inventory.items.delete_success'));
    } catch {
      messageApi.error(t('inventory.items.delete_failed'));
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Button onClick={() => setShowCreateItemModal(true)} type='primary' icon={<IoIosAddCircle style={{ fontSize: '20px' }} />}>
                {t('inventory.items.create_item')}
              </Button>

              <Popconfirm
                title={
                  locale === 'en'
                    ? 'This action is irreversible. Are you sure you want to delete?'
                    : 'Это действие необратимо. Вы уверены, что хотите удалить?'
                }
                onConfirm={deleteManyItemsHandler}
                open={isDeleting}
                onOpenChange={(visible) => setIsDeleting(visible)}
                okText={locale === 'en' ? 'Yes, delete!' : 'Да, удалить!'}
                cancelText={locale === 'en' ? 'Cancel' : 'Отмена'}
                placement='topRight'
                getPopupContainer={(trigger) => trigger.parentElement || document.body}
                okButtonProps={{ danger: true, style: { backgroundColor: 'red', borderColor: 'red' } }}
                cancelButtonProps={{ style: { backgroundColor: 'var(--secondary-text-color)', color: '#FFFFFF' } }}
              >
                <Button className='inventory_items_delete_button' type='primary' danger disabled={!selectedRowKeys.length}>
                  {t('inventory.items.delete_selected')}
                </Button>
              </Popconfirm>
            </div>
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
              columns={getInventoryItemsColumns(t, handleToggleLike, currentInventoryUser?.id, handleOpenLikesModal)}
              dataSource={filteredItems}
              rowKey='id'
              pagination={false}
              rowSelection={{
                type: 'checkbox',
                onChange: (keys) => setSelectedRowKeys(keys),
              }}
              locale={{
                emptyText: (
                  <div style={{ textAlign: 'center' }}>
                    <Empty description={<span style={{ color: 'var(--red-color)' }}>No items</span>} />
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

      <LikesListModal open={showLikesListModal} onClose={() => setShowLikesListModal(false)} likes={selectedLikes} />
    </div>
  );
};
