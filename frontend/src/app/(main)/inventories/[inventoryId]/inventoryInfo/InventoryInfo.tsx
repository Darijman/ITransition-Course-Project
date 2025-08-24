'use client';

import { Inventory } from '@/interfaces/Inventory';
import { Empty, Input, Table, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { inventoryUsersColumns } from './columns';
import { useMemo, useState } from 'react';
import { InventoryUserRoles } from '@/interfaces/InventoryUserRoles';
import { InventoryUser } from '@/interfaces/InventoryUser';
import './inventoryInfo.css';

const { Title, Paragraph } = Typography;

// Make sure Creator is always first
const sortUsers = (users: InventoryUser[]) => {
  const creators = users.filter((u) => u.role === InventoryUserRoles.CREATOR);
  const others = users.filter((u) => u.role !== InventoryUserRoles.CREATOR);
  return [...creators, ...others];
};

interface Props {
  inventory: Inventory | null;
}

export const InventoryInfo = ({ inventory }: Props) => {
  const t = useTranslations();
  const [searchValue, setSearchValue] = useState<string>('');

  const filteredUsers = useMemo(() => {
    const users = inventory?.inventoryUsers ?? [];
    if (!searchValue) return sortUsers(users);

    const search = searchValue.toLowerCase();
    const filtered = users.filter((user) => user.name?.toLowerCase().includes(search) || user.role?.toLowerCase().includes(search));

    return sortUsers(filtered);
  }, [inventory?.inventoryUsers, searchValue]);

  return (
    <div>
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
          </div>
          <Table
            className='inventory_users_table'
            columns={inventoryUsersColumns}
            dataSource={filteredUsers}
            rowKey='id'
            pagination={false}
            scroll={{ y: 600 }}
            locale={{
              emptyText: (
                <div style={{ textAlign: 'center' }}>
                  <Empty description={<span style={{ color: 'var(--red-color)' }}>No data</span>} />
                </div>
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
};
