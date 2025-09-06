'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { getInventoryItemsColumns } from './columns';
import { Button, Empty, Input, message, Popconfirm, Spin, Table, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { IoIosAddCircle } from 'react-icons/io';
import { DeleteOutlined } from '@ant-design/icons';
import { CreateItemModal } from './createItemModal/CreateItemModal';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { canModifyInventory } from '@/helpers/canModifyInventory';
import { LikesListModal } from './likesListModal/LikesListModal';
import { useLocale } from '@/contexts/localeContext/LocaleContext';
import { Inventory } from '@/interfaces/inventories/Inventory';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import { UserRoles } from '@/interfaces/users/UserRoles.enum';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../../../../../axiosConfig';
import './inventoryItems.css';

const { Title } = Typography;
const limit: number = 10;

interface Props {
  currentInventoryUser: InventoryUser | null;
  inventory: Inventory | null;
  setInventory: React.Dispatch<React.SetStateAction<Inventory | null>>;
}

export const InventoryItems = ({ currentInventoryUser, inventory, setInventory }: Props) => {
  const { user } = useAuth();
  const { locale } = useLocale();
  const t = useTranslations();

  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [searchValue, setSearchValue] = useState<string>('');
  const [offset, setOffset] = useState<number>(inventory?.items?.length ? inventory.items.length : 0);
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  const [showCreateItemModal, setShowCreateItemModal] = useState<boolean>(false);
  const [showLikesListModal, setShowLikesListModal] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (!inventory?.id) return;

    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/inventory_items/inventory/${inventory.id}`, {
          params: { offset: 0, limit, searchValue },
        });

        setInventory((prev) => (prev ? { ...prev, items: data } : prev));
        setOffset(data.length);
        setHasMore(data.length === limit);
      } catch {
        messageApi.open({ type: 'error', content: t('inventory.items.failed_to_load_items') });
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [inventory?.id, searchValue, messageApi, setInventory, t]);

  const loadMore = async () => {
    if (isLoading || !hasMore || !inventory?.id) return;
    setIsLoading(true);

    try {
      const nextOffset = offset + limit;
      const { data } = await api.get(`/inventory_items/inventory/${inventory.id}`, {
        params: { offset: nextOffset, limit, searchValue },
      });
      setInventory((prev) => (prev ? { ...prev, items: [...(prev.items || []), ...data] } : prev));
      setHasMore(data.length === limit);
      setOffset(nextOffset);
    } catch {
      messageApi.open({ type: 'error', content: 'Failed to load more data!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenLikesModal = useCallback((itemId: number) => {
    setSelectedItemId(itemId);
    setShowLikesListModal(true);
  }, []);

  const handleToggleLike = useCallback(
    async (itemId: number, likeId?: number) => {
      if (!currentInventoryUser) return;
      const action: 'like' | 'unlike' = likeId ? 'unlike' : 'like';

      try {
        if (likeId) {
          await api.delete(`/inventory_item_likes/${likeId}`);
        } else {
          await api.post(`/inventory_item_likes`, { itemId });
        }
      } catch {
        messageApi.error({ content: action === 'like' ? t('inventory.items.like_failed') : t('inventory.items.unlike_failed') });
      }
    },
    [currentInventoryUser, messageApi, t],
  );

  const deleteManyItemsHandler = async () => {
    if (!canModifyInventory(currentInventoryUser, user) || !selectedRowKeys.length) return;

    try {
      await api.delete(`/inventory_items`, { data: { itemIds: selectedRowKeys } });
      setInventory((prev) => (prev ? { ...prev, items: prev.items?.filter((i) => !selectedRowKeys.includes(i.id)) } : prev));
      setSelectedRowKeys([]);
      messageApi.success(t('inventory.items.delete_success'));
    } catch {
      messageApi.error(t('inventory.items.delete_failed'));
    }
  };

  const columns = useMemo(
    () => getInventoryItemsColumns(t, handleToggleLike, currentInventoryUser?.id, handleOpenLikesModal),
    [t, handleToggleLike, currentInventoryUser?.id, handleOpenLikesModal],
  );

  const filteredItems = useMemo(() => {
    if (!inventory?.items) return [];
    if (!searchValue) return inventory.items;
    return inventory.items.filter((item) => item.title?.toLowerCase().includes(searchValue.toLowerCase()));
  }, [inventory?.items, searchValue]);

  const canSelectRows =
    currentInventoryUser &&
    user &&
    (currentInventoryUser.role === InventoryUserRoles.CREATOR ||
      currentInventoryUser.role === InventoryUserRoles.EDITOR ||
      user.role === UserRoles.ADMIN);

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
                <Button
                  icon={<DeleteOutlined style={{ fontSize: '20px' }} />}
                  className='inventory_items_delete_button'
                  type='primary'
                  danger
                  disabled={!selectedRowKeys.length}
                >
                  {t('inventory.items.delete_selected')}
                </Button>
              </Popconfirm>
            </div>
          ) : null}
        </div>

        <div id='inventory_items_table' style={{ height: 500, overflow: 'auto' }}>
          <InfiniteScroll
            dataLength={filteredItems.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Spin size='large' />
              </div>
            }
            scrollableTarget='inventory_items_table'
            scrollThreshold='100px'
          >
            <Table
              className='items_table'
              columns={columns}
              dataSource={filteredItems}
              rowKey='id'
              pagination={false}
              rowSelection={
                canSelectRows
                  ? {
                      selectedRowKeys,
                      type: 'checkbox',
                      onChange: (keys) => setSelectedRowKeys(keys),
                    }
                  : undefined
              }
              locale={{
                emptyText: (
                  <div style={{ textAlign: 'center' }}>
                    <Empty description={<span style={{ color: 'var(--red-color)' }}>{t('inventory.items.no_items')}</span>} />
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
        inventoryId={inventory?.id ? inventory.id : 1}
      />

      <LikesListModal
        open={showLikesListModal}
        onClose={() => setShowLikesListModal(false)}
        likes={inventory?.items?.find((i) => i.id === selectedItemId)?.likes ?? []}
      />
    </div>
  );
};
