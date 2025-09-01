'use client';

import { Badge, Button, Empty, Input, message, Spin, Table, Tooltip, Typography } from 'antd';
import { Select } from '@/components/select/Select';
import { useEffect, useMemo, useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { columns } from './columns';
import { InventoryInvite, InventoryInviteStatuses } from '@/interfaces/inventories/InventoryInvite';
import { useNotifications } from '@/contexts/notificationContext/NotificationContext';
import { NotificationStatuses } from '@/interfaces/notifications/NotificationStatuses.enum';
import { Notifications } from '@/interfaces/notifications/Notifications.enum';
import { useSocket } from '@/contexts/socketContext/SocketContext';
import { useAuth } from '@/contexts/authContext/AuthContext';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../../../../../axiosConfig';
import './userInvitations.css';

const { Title } = Typography;
const limit: number = 10;

export const UserInvitations = () => {
  const t = useTranslations();

  const { unreadCounts } = useNotifications();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { markAsRead, notifications } = useNotifications();

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
        const { data } = await api.get('/inventory_invites/user', { params: { ...filters, offset: 0, limit } });
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
  }, [filters, t]);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const { data } = await api.get('/inventory_invites/user', { params: { ...filters, offset, limit } });
      setInvites((prev) => [...prev, ...data]);
      setHasMore(data.length === limit);
      setOffset((prev) => prev + data.length);
    } catch {
      messageApi.error(t('profile.user_invitations.failed_to_load_more'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      await api.post('/inventory_invites/accept', { inviteIds: selectedRowKeys });
      setInvites((prev) =>
        prev.map((invite) => (selectedRowKeys.includes(invite.id) ? { ...invite, status: InventoryInviteStatuses.ACCEPTED } : invite)),
      );
      selectedRowKeys.forEach((id) => {
        const notif = notifications.find((n) => n.type === Notifications.INVITE && n.data?.id === id);
        if (notif && notif.status === NotificationStatuses.UNREAD) markAsRead(notif.id);
      });
      setSelectedRowKeys([]);
      messageApi.success(t('profile.user_invitations.invitations_accepted'));
    } catch {
      messageApi.error(t('profile.user_invitations.failed_to_accept_invitations'));
    }
  };

  const handleReject = async () => {
    try {
      await api.post('/inventory_invites/reject', { inviteIds: selectedRowKeys });
      setInvites((prev) =>
        prev.map((invite) => (selectedRowKeys.includes(invite.id) ? { ...invite, status: InventoryInviteStatuses.REJECTED } : invite)),
      );
      selectedRowKeys.forEach((id) => {
        const notif = notifications.find((n) => n.type === Notifications.INVITE && n.data?.id === id);
        if (notif && notif.status === NotificationStatuses.UNREAD) markAsRead(notif.id);
      });
      setSelectedRowKeys([]);
      messageApi.success(t('profile.user_invitations.invitations_rejected'));
    } catch {
      messageApi.error(t('profile.user_invitations.failed_to_reject_invitations'));
    }
  };

  const filteredInvites = useMemo(() => {
    return invites.filter((invite) => {
      if (filters.status !== 'ALL' && invite.status !== filters.status) return false;
      if (filters.searchValue && !invite.inventory?.title?.toLowerCase().includes(filters.searchValue.toLowerCase())) return false;
      return true;
    });
  }, [invites, filters]);

  return (
    <div className='inventories_table'>
      {contextHolder}

      <div className='invites_table_header'>
        <Title level={3} style={{ margin: 0 }}>
          {t('profile.user_invitations.title')}
          <span style={{ marginLeft: 10 }}>
            <Badge count={unreadCounts.INVITE} overflowCount={99} />
          </span>
        </Title>

        <Input.Search
          className='custom_search'
          style={{ width: 200 }}
          placeholder={t('home.inventories_table_search_placeholder')}
          value={filters.searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <div className='user_invitations_buttons'>
          <Tooltip title={t('profile.user_invitations.accept_tooltip')}>
            <Button
              className='user_invitations_accept_button'
              onClick={handleAccept}
              disabled={!selectedRowKeys.length}
              type='primary'
              icon={<CheckOutlined />}
            >
              Accept
            </Button>
          </Tooltip>
          <Tooltip className='user_invitations_reject_button' title={t('profile.user_invitations.reject_tooltip')}>
            <Button onClick={handleReject} disabled={!selectedRowKeys.length} type='primary' danger icon={<CloseOutlined />}>
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
        <div id='user_invitations_table' style={{ height: 500, overflow: 'auto' }}>
          <InfiniteScroll
            dataLength={filteredInvites.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Spin size='large' />
              </div>
            }
            scrollableTarget='user_invitations_table'
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
      )}
    </div>
  );
};
