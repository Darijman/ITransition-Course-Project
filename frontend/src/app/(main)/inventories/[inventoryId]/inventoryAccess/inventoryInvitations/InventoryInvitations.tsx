'use client';

import { Empty, Input, message, Spin, Table, Typography } from 'antd';
import { Select } from '@/components/select/Select';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getInventoryInvitationColumns } from './columns';
import { InventoryInvite, InventoryInviteStatuses } from '@/interfaces/inventories/InventoryInvite';
import { useSocket } from '@/contexts/socketContext/SocketContext';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { Inventory } from '@/interfaces/inventories/Inventory';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../../../../../../axiosConfig';
import './inventoryInvitations.css';

const { Title } = Typography;
const limit: number = 10;

interface Props {
  currentInventoryUser: InventoryUser | null;
  inventory: Inventory | null;
  setInventory: React.Dispatch<React.SetStateAction<Inventory | null>>;
}

export const InventoryInvitations = ({ currentInventoryUser, inventory, setInventory }: Props) => {
  const t = useTranslations();

  const { user } = useAuth();
  const { socket } = useSocket();

  const [invites, setInvites] = useState<InventoryInvite[]>([]);
  const [filters, setFilters] = useState({ status: 'ALL', searchValue: '' });
  const [offset, setOffset] = useState<number>(0);

  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [errorText, setErrorText] = useState<string>('');
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  const handleSearchChange = (val: string) => {
    setFilters((prev) => ({ ...prev, searchValue: val }));
    setOffset(0);
  };

  const handleStatusChange = (val: 'ALL' | InventoryInviteStatuses) => {
    setFilters((prev) => ({ ...prev, status: val }));
    setOffset(0);
  };

  useEffect(() => {
    if (!socket || !user.id) return;

    const handler = (invite: InventoryInvite) => setInvites((prev) => [invite, ...prev]);
    socket.on('inventory-invite', handler);

    return () => {
      socket.off('inventory-invite', handler);
    };
  }, [socket, user.id]);

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/inventory_invites/inventory/${inventory?.id}`, { params: { ...filters, offset: 0, limit } });
        setInvites(data);
        setHasMore(data.length === limit);
        setOffset(data.length);
      } catch {
        setErrorText(t('profile.user_invitations.failed_to_load'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitial();
  }, [filters, t, inventory?.id]);

  const loadMore = async () => {
    if (isLoading || !hasMore || !inventory?.id) return;
    setIsLoading(true);

    try {
      const { data } = await api.get(`/inventory_invites/inventory/${inventory.id}`, { params: { ...filters, offset, limit } });
      setInvites((prev) => [...prev, ...data]);
      setHasMore(data.length === limit);
      setOffset((prev) => prev + data.length);
    } catch {
      messageApi.error(t('profile.user_invitations.failed_to_load_more'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='inventory_invites_table'>
      {contextHolder}

      <div className='invites_table_header'>
        <Title level={3} style={{ margin: 0 }}>
          {t('profile.user_invitations.title')}
        </Title>

        <Input.Search
          className='custom_search'
          style={{ width: 200 }}
          placeholder={t('inventory.access.search_invite_placeholder')}
          value={filters.searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <Select
          options={[
            { label: t('home.select_status_all'), value: 'ALL' },
            { label: t('profile.user_invitations.statuses.pending'), value: 'PENDING' },
            { label: t('profile.user_invitations.statuses.accepted'), value: 'ACCEPTED' },
            { label: t('profile.user_invitations.statuses.rejected'), value: 'REJECTED' },
            { label: t('profile.user_invitations.statuses.expired'), value: 'EXPIRED' },
          ]}
          value={filters.status}
          onChange={handleStatusChange}
          style={{ width: 200 }}
        />
      </div>

      {errorText ? (
        <Title level={4} style={{ textAlign: 'center', color: 'var(--red-color)' }}>
          {errorText}
        </Title>
      ) : (
        <div id='inventory_invitations_table' style={{ height: 500, overflow: 'auto' }}>
          <InfiniteScroll
            dataLength={invites.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Spin size='large' />
              </div>
            }
            scrollableTarget='inventory_invitations_table'
            scrollThreshold='100px'
          >
            <Table
              className='invites_table'
              rowClassName={(record) => (record.status === InventoryInviteStatuses.PENDING ? 'row-pending' : '')}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onChange: setSelectedRowKeys,
                getCheckboxProps: (record) => ({ disabled: record.status !== InventoryInviteStatuses.PENDING }),
              }}
              columns={getInventoryInvitationColumns(t)}
              dataSource={invites}
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
