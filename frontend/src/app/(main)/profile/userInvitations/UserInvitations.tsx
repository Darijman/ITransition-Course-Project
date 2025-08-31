'use client';

import { Button, Empty, Input, message, Spin, Table, Tooltip, Typography } from 'antd';
import { Select } from '@/components/select/Select';
import {  useEffect, useMemo, useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { columns } from './columns';
import { InventoryInvite, InventoryInviteStatuses } from '@/interfaces/inventories/InventoryInvite';
import { useNotifications } from '@/contexts/notificationContext/NotificationContext';
import { NotificationStatuses } from '@/interfaces/notifications/NotificationStatuses.enum';
import { Notifications } from '@/interfaces/notifications/Notifications.enum';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../../../../axiosConfig';
import './userInvitations.css';

const { Title } = Typography;

interface Query {
  offset?: number;
  limit?: number;
  status?: 'ALL' | InventoryInviteStatuses;
  searchValue?: string;
}

export const UserInvitations = () => {
  const t = useTranslations();

  const [invites, setInvites] = useState<InventoryInvite[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [searchValue, setSearchValue] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InventoryInviteStatuses>('ALL');

  const { markAsRead, notifications } = useNotifications();
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

  const handleStatusChange = (val: 'ALL' | InventoryInviteStatuses) => {
    setStatusFilter(val);
    setQuery((prev) => ({ ...prev, status: val, offset: 0 }));
  };

  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/inventory_invites/user`, { params: query });
        setInvites(data);
        setHasMore(data.length === (query.limit ?? 10));
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
      const { data } = await api.get(`/inventory_invites/user`, {
        params: { ...query, offset: nextOffset },
      });

      setInvites((prev) => [...prev, ...data]);
      setHasMore(data.length === (query.limit ?? 10));
      setQuery((prev) => ({ ...prev, offset: nextOffset }));
    } catch {
      messageApi.open({ type: 'error', content: 'Failed to load more data!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      await api.post('/inventory_invites/accept', { inviteIds: selectedRowKeys });
      messageApi.success('Invitations accepted!');
      setInvites((prev) =>
        prev.map((invite) => (selectedRowKeys.includes(invite.id) ? { ...invite, status: InventoryInviteStatuses.ACCEPTED } : invite)),
      );

      selectedRowKeys.forEach((inviteId) => {
        const notification = notifications.find((n) => n.type === Notifications.INVITE && n.data?.inventoryId === inviteId);
        if (notification && notification.status === NotificationStatuses.UNREAD) {
          markAsRead(notification.id);
        }
      });
      setSelectedRowKeys([]);
    } catch {
      messageApi.error('Failed to accept invites!');
    }
  };

  const handleReject = async () => {
    try {
      await api.post('/inventory_invites/reject', { inviteIds: selectedRowKeys });
      messageApi.success('Invitations rejected!');
      setInvites((prev) =>
        prev.map((invite) => (selectedRowKeys.includes(invite.id) ? { ...invite, status: InventoryInviteStatuses.REJECTED } : invite)),
      );

      selectedRowKeys.forEach((inviteId) => {
        const notification = notifications.find((n) => n.type === Notifications.INVITE && n.data?.inventoryId === inviteId);
        if (notification && notification.status === NotificationStatuses.UNREAD) {
          markAsRead(notification.id);
        }
      });
      setSelectedRowKeys([]);
    } catch {
      messageApi.error('Failed to reject invites!');
    }
  };

  const filteredInvites = useMemo(() => {
    return invites.filter((invite) => {
      if (statusFilter !== 'ALL' && invite.status !== statusFilter) return false;
      if (searchValue && !invite.inventory?.title?.toLowerCase().includes(searchValue.toLowerCase())) return false;

      return true;
    });
  }, [invites, statusFilter, searchValue]);

  return (
    <div className='inventories_table'>
      {contextHolder}
      <div className='inventories_table_header'>
        <Title level={3} style={{ margin: 0 }}>
          {t('profile.user_invitations.title')}
        </Title>

        <Input.Search
          className='custom_search'
          style={{ width: 200 }}
          placeholder={t('home.inventories_table_search_placeholder')}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <div className='user_invitations_buttons'>
          <Tooltip mouseEnterDelay={1} title={t('profile.user_invitations.accept_tooltip')}>
            <Button
              onClick={handleAccept}
              className='user_invitations_accept_button'
              disabled={!selectedRowKeys.length}
              type='primary'
              icon={<CheckOutlined style={{ fontSize: '20px' }} />}
            >
              Accept
            </Button>
          </Tooltip>
          <Tooltip mouseEnterDelay={1} title={t('profile.user_invitations.reject_tooltip')}>
            <Button
              onClick={handleReject}
              className='user_invitations_reject_button'
              disabled={!selectedRowKeys.length}
              type='primary'
              danger
              icon={<CloseOutlined style={{ fontSize: '20px' }} />}
            >
              Reject
            </Button>
          </Tooltip>
        </div>

        <Select
          options={[
            { label: t('home.select_status_all'), value: 'ALL' },
            { label: t('profile.user_invitations.statuses.pending'), value: 'PENDING' },
            { label: t('profile.user_invitations.statuses.accepted'), value: 'ACCEPTED' },
            { label: t('profile.user_invitations.statuses.rejected'), value: 'REJECTED' },
            { label: t('profile.user_invitations.statuses.expired'), value: 'EXPIRED' },
          ]}
          placeholder='Select a status'
          value={statusFilter}
          style={{ width: 200 }}
          onChange={handleStatusChange}
        />
      </div>

      <div id='scrollable-table-body' style={{ height: 500, overflow: 'auto' }}>
        <InfiniteScroll
          dataLength={filteredInvites.length}
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
          <Table<InventoryInvite>
            className='invites_table'
            rowClassName={(record) => (record.status === InventoryInviteStatuses.PENDING ? 'row-pending' : '')}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
              getCheckboxProps: (record) => ({
                disabled: record.status !== InventoryInviteStatuses.PENDING,
              }),
            }}
            columns={columns}
            dataSource={filteredInvites}
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
