'use client';

import { Button, Empty, Input, message, Popconfirm, Spin, Table, Typography } from 'antd';
import { Select } from '@/components/select/Select';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getInventoryInvitationColumns } from './columns';
import { InventoryInviteStatuses } from '@/interfaces/inventories/InventoryInvite';
import { DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { Inventory } from '@/interfaces/inventories/Inventory';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import { UserRoles } from '@/interfaces/users/UserRoles.enum';
import { useLocale } from '@/contexts/localeContext/LocaleContext';
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
  const { locale } = useLocale();

  const [filters, setFilters] = useState({ status: 'ALL', searchValue: '' });
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeletingInvitations, setIsDeletingInvitations] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  useEffect(() => {
    if (!inventory?.id) return;

    const fetchInvitations = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/inventory_invites/inventory/${inventory.id}`, {
          params: { offset: 0, limit, ...filters },
        });

        setInventory((prev) => (prev ? { ...prev, invites: data } : prev));
        setOffset(data.length);
        setHasMore(data.length === limit);
      } catch {
        messageApi.error(t('inventory.items.failed_to_load_items'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, [inventory?.id, filters, t, messageApi, setInventory]);

  const loadMore = async () => {
    if (isLoading || !hasMore || !inventory?.id) return;

    setIsLoading(true);
    try {
      const { data } = await api.get(`/inventory_invites/inventory/${inventory.id}`, {
        params: { offset, limit, ...filters },
      });

      setInventory((prev) =>
        prev
          ? {
              ...prev,
              invites: [...(prev.invites ?? []), ...data],
            }
          : prev,
      );

      setOffset((prev) => prev + data.length);
      setHasMore(data.length === limit);
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

  const columns = useMemo(() => getInventoryInvitationColumns(t), [t]);

  const filteredInvitations = useMemo(() => {
    if (!inventory?.invites) return [];
    if (!filters.searchValue) return inventory.invites;

    return inventory.invites.filter((invite) => {
      const search = filters.searchValue.toLowerCase();

      return (
        invite.inviteeEmail?.toLowerCase().includes(search) ||
        invite.inviter?.user?.name?.toLowerCase().includes(search) ||
        invite.inviter?.user?.email?.toLowerCase().includes(search) ||
        invite.invitee?.user?.name?.toLowerCase().includes(search) ||
        invite.invitee?.user?.email?.toLowerCase().includes(search) ||
        invite.inviteeUser?.name?.toLowerCase().includes(search) ||
        invite.inviteeUser?.email?.toLowerCase().includes(search)
      );
    });
  }, [inventory?.invites, filters.searchValue]);

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

        <Popconfirm
          title={
            locale === 'en'
              ? 'This action is irreversible. Are you sure you want to delete?'
              : 'Это действие необратимо. Вы уверены, что хотите удалить?'
          }
          onConfirm={deleteManyInvitesHandler}
          open={isDeletingInvitations}
          onOpenChange={(prev) => setIsDeletingInvitations(prev)}
          okText={locale === 'en' ? 'Yes, delete!' : 'Да, удалить!'}
          cancelText={locale === 'en' ? 'Cancel' : 'Отмена'}
          placement='topRight'
          getPopupContainer={(trigger) => trigger.parentElement || document.body}
          okButtonProps={{ danger: true, style: { backgroundColor: 'red', borderColor: 'red' } }}
          cancelButtonProps={{ style: { backgroundColor: 'var(--secondary-text-color)', color: '#FFFFFF' } }}
        >
          <Button
            className='inventory_invitations_delete_button'
            disabled={!selectedRowKeys.length}
            type='primary'
            danger
            icon={<DeleteOutlined style={{ fontSize: '20px' }} />}
          >
            {t('inventory.access.cancel_invitations')}
          </Button>
        </Popconfirm>

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
          dataLength={filteredInvitations.length}
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
            columns={columns}
            dataSource={filteredInvitations}
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
