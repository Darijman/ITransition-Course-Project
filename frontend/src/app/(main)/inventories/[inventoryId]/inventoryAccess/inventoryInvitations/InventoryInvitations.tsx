'use client';

import { Button, Empty, Input, message, Spin, Table, Typography } from 'antd';
import { Select } from '@/components/select/Select';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getInventoryInvitationColumns } from './columns';
import { InventoryInvite, InventoryInviteStatuses } from '@/interfaces/inventories/InventoryInvite';
import { useSocket } from '@/contexts/socketContext/SocketContext';
import { DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { Inventory } from '@/interfaces/inventories/Inventory';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import { UserRoles } from '@/interfaces/users/UserRoles.enum';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../../../../../../axiosConfig';
import './inventoryInvitations.css';

const { Title } = Typography;
const LIMIT: number = 10;

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
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  useEffect(() => {
    if (!inventory?.invites) return;

    const sortedInvites = [...inventory.invites].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const initial = sortedInvites.slice(0, LIMIT);
    setInvites(initial);
    setOffset(initial.length);
    setHasMore(sortedInvites.length > LIMIT);
  }, [inventory]);

  useEffect(() => {
    if (!inventory?.invites) return;

    let filtered = [...inventory.invites];

    if (filters.status !== 'ALL') {
      filtered = filtered.filter((inv) => inv.status === filters.status);
    }

    if (filters.searchValue) {
      const search = filters.searchValue.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.inviteeEmail?.toLowerCase().includes(search) ||
          inv.inviteeUser?.name?.toLowerCase().includes(search) ||
          inv.inviteeUser?.email?.toLowerCase().includes(search),
      );
    }

    const initial = filtered.slice(0, LIMIT);
    setInvites(initial);
    setOffset(initial.length);
    setHasMore(filtered.length > LIMIT);
  }, [filters, inventory]);

  useEffect(() => {
    if (!socket || !user.id || !inventory?.id) return;

    const handleUpdatedInvite = (updated: InventoryInvite) => {
      setInvites((prev) => prev.map((inv) => (inv.id === updated.id ? { ...inv, status: updated.status } : inv)));
      setInventory((prev) =>
        prev ? { ...prev, invites: prev.invites?.map((inv) => (inv.id === updated.id ? { ...inv, status: updated.status } : inv)) } : prev,
      );
    };

    const handleInviteDeleted = (data: { inviteId: number; inventoryId: number }) => {
      if (data.inventoryId !== inventory?.id) return;

      setInvites((prevSlice) => prevSlice.filter((inv) => inv.id !== data.inviteId));
      setInventory((prev) => {
        if (!prev) return prev;
        const newInvites = prev.invites?.filter((inv) => inv.id !== data.inviteId) || [];
        return { ...prev, invites: newInvites };
      });
    };

    socket.on('inventory-invite-updated', handleUpdatedInvite);
    socket.on('inventory-invite-deleted', handleInviteDeleted);

    return () => {
      socket.off('inventory-invite-updated', handleUpdatedInvite);
      socket.off('inventory-invite-deleted', handleInviteDeleted);
    };
  }, [socket, user.id, setInventory, inventory?.id]);

  const loadMore = async () => {
    if (isLoading || !hasMore || !inventory?.id) return;

    setIsLoading(true);
    try {
      const { data } = await api.get(`/inventory_invites/inventory/${inventory.id}`, {
        params: { offset, limit: LIMIT, ...filters },
      });

      setInvites((prev) => [...prev, ...data]);
      setOffset((prev) => prev + data.length);
      setHasMore(data.length === LIMIT);
    } catch {
      messageApi.error(t('profile.user_invitations.failed_to_load_more'));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteManyInvitesHandler = async () => {
    if (!selectedRowKeys.length) return;
    if (currentInventoryUser?.role !== InventoryUserRoles.CREATOR && user.role !== UserRoles.ADMIN) return;

    try {
      await api.delete('/inventory_invites', { data: { inviteIds: selectedRowKeys } });

      setSelectedRowKeys([]);
      messageApi.success({ content: t('inventory.access.invitations_deleted') });
    } catch {
      messageApi.error({ content: t('inventory.access.failed_to_delete_invitations') });
    }
  };

  const handleSearchChange = (val: string) => setFilters((prev) => ({ ...prev, searchValue: val }));
  const handleStatusChange = (val: 'ALL' | InventoryInviteStatuses) => setFilters((prev) => ({ ...prev, status: val }));

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

        <Button
          className='inventory_invitations_delete_button'
          disabled={!selectedRowKeys.length}
          onClick={deleteManyInvitesHandler}
          type='primary'
          danger
          icon={<DeleteOutlined style={{ fontSize: '20px' }} />}
        >
          {t('inventory.access.cancel_invitations')}
        </Button>

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
                  <Empty description={<span style={{ color: 'var(--red-color)' }}>{t('inventory.access.no_invitations')}</span>} />
                </div>
              ),
            }}
          />
        </InfiniteScroll>
      </div>
    </div>
  );
};
