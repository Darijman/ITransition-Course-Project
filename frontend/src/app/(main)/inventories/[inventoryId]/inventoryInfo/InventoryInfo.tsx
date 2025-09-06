'use client';

import { Inventory } from '@/interfaces/inventories/Inventory';
import { Button, Empty, Input, message, Popconfirm, Popover, Table, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { getInventoryUsersColumns } from './columns';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { useMemo, useState } from 'react';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { UserRoles } from '@/interfaces/users/UserRoles.enum';
import api from '../../../../../../axiosConfig';
import './inventoryInfo.css';
import { useLocale } from '@/contexts/localeContext/LocaleContext';

const { Title, Paragraph } = Typography;

// Make sure Creator is always first
const sortUsers = (users: InventoryUser[]) => {
  const creators = users.filter((u) => u.role === InventoryUserRoles.CREATOR);
  const others = users.filter((u) => u.role !== InventoryUserRoles.CREATOR);
  return [...creators, ...others];
};

interface Props {
  inventory: Inventory | null;
  currentInventoryUser: InventoryUser | null;
}

export const InventoryInfo = ({ inventory, currentInventoryUser }: Props) => {
  const { user } = useAuth();
  const t = useTranslations();
  const { locale } = useLocale();

  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  const [isDeletingUsers, setIsDeletingUsers] = useState<boolean>(false);
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
  const [isChangingUsersRoles, setIsChangingUsersRoles] = useState<boolean>(false);

  const canModify: boolean = currentInventoryUser?.role === InventoryUserRoles.CREATOR || user.role === UserRoles.ADMIN;

  const deleteInventoryUsersHandler = async () => {
    if (!canModify || !inventory) return;

    try {
      await api.delete(`/inventory_users/${inventory.id}`, { data: { inventoryUserIds: selectedRowKeys } });
      setSelectedRowKeys([]);

      messageApi.success({
        content: t('inventory.info.users_deleted_successfully'),
      });
    } catch {
      messageApi.error({
        content: t('inventory.info.failed_to_delete_users'),
      });
    }
  };

  const changeInventoryUsersRolesHandler = async (role: InventoryUserRoles) => {
    if (!canModify || !inventory) return;
    setIsChangingUsersRoles(true);

    try {
      await api.patch(`/inventory_users/inventory/${inventory.id}/roles`, {
        inventoryUserIds: selectedRowKeys,
        newRole: role,
      });

      messageApi.success({
        content: t('inventory.info.roles_updated_successfully'),
      });
    } catch {
      messageApi.error({
        content: t('inventory.info.failed_to_update_roles'),
      });
    } finally {
      setPopoverVisible(false);
      setSelectedRowKeys([]);
      setIsChangingUsersRoles(false);
    }
  };

  const popoverContent = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <Button type='primary' style={{ width: 120 }} onClick={() => changeInventoryUsersRolesHandler(InventoryUserRoles.VIEWER)}>
        {t('inventory.roles.VIEWER')}
      </Button>
      <Button type='primary' style={{ width: 120 }} onClick={() => changeInventoryUsersRolesHandler(InventoryUserRoles.EDITOR)}>
        {t('inventory.roles.EDITOR')}
      </Button>
    </div>
  );

  const columns = useMemo(() => getInventoryUsersColumns(t, user), [t, user]);

  const filteredUsers = useMemo(() => {
    const users = inventory?.inventoryUsers ?? [];
    if (!searchValue) return sortUsers(users);

    const search = searchValue.toLowerCase();
    const filtered = users.filter((user) => user.name?.toLowerCase().includes(search) || user.role?.toLowerCase().includes(search));

    return sortUsers(filtered);
  }, [inventory?.inventoryUsers, searchValue]);

  return (
    <div>
      {contextHolder}

      <Title level={3} style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
        {t('inventory.info.title')}
      </Title>

      <div>
        <div className='inventory_info_description'>
          <Title level={3} style={{ margin: '0 0 10px 0' }}>
            {t('inventory.info.description')}
          </Title>
          <Paragraph>{inventory?.description}</Paragraph>
        </div>

        <div className='inventory_info_users_table'>
          <div className='inventory_info_users_table_header'>
            <Title level={3} style={{ margin: 0 }}>
              {t('inventory.info.table_title')}
            </Title>

            <Input.Search
              className='custom_search'
              style={{ width: 200 }}
              placeholder={t('inventory.info.table_search_placeholder')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />

            {canModify ? (
              <>
                <Popconfirm
                  title={
                    locale === 'en'
                      ? 'This action is irreversible. Are you sure you want to delete?'
                      : 'Это действие необратимо. Вы уверены, что хотите удалить?'
                  }
                  onConfirm={deleteInventoryUsersHandler}
                  open={isDeletingUsers}
                  onOpenChange={(visible) => setIsDeletingUsers(visible)}
                  okText={locale === 'en' ? 'Yes, delete!' : 'Да, удалить!'}
                  cancelText={locale === 'en' ? 'Cancel' : 'Отмена'}
                  placement='topRight'
                  getPopupContainer={(trigger) => trigger.parentElement || document.body}
                  okButtonProps={{ danger: true, style: { backgroundColor: 'red', borderColor: 'red' } }}
                  cancelButtonProps={{ style: { backgroundColor: 'var(--secondary-text-color)', color: '#FFFFFF' } }}
                >
                  <Button
                    className='inventory_info_delete_users_button'
                    disabled={!selectedRowKeys.length}
                    type='primary'
                    danger
                    icon={<DeleteOutlined style={{ fontSize: '20px' }} />}
                  >
                    {t('inventory.info.delete_users')}
                  </Button>
                </Popconfirm>

                <Popover
                  content={popoverContent}
                  title={<div style={{ textAlign: 'center' }}>{t('inventory.access.select_role')}</div>}
                  trigger='click'
                  open={popoverVisible}
                  onOpenChange={(visible) => setPopoverVisible(visible)}
                >
                  <Button
                    className='inventory_info_role_button'
                    disabled={!selectedRowKeys.length}
                    type='primary'
                    icon={<TeamOutlined style={{ fontSize: '20px' }} />}
                    loading={isChangingUsersRoles}
                  >
                    {t('inventory.info.change_roles')}
                  </Button>
                </Popover>
              </>
            ) : null}
          </div>

          <Table
            className='inventory_users_table'
            columns={columns}
            dataSource={filteredUsers}
            rowKey='id'
            pagination={false}
            rowSelection={
              currentInventoryUser?.role === InventoryUserRoles.CREATOR || user?.role === UserRoles.ADMIN
                ? {
                    selectedRowKeys,
                    type: 'checkbox',
                    onChange: (keys) => setSelectedRowKeys(keys),
                    getCheckboxProps: (record) => ({
                      disabled: record.role === InventoryUserRoles.CREATOR,
                    }),
                  }
                : undefined
            }
            scroll={{ y: 600 }}
            locale={{
              emptyText: (
                <div style={{ textAlign: 'center' }}>
                  <Empty description={<span style={{ color: 'var(--red-color)' }}>{t('inventory.info.no_users')}</span>} />
                </div>
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
};
