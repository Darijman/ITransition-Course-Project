import { ColumnsType } from 'antd/es/table';
import { Typography, Image, Tag } from 'antd';
import { formatDate } from '@/helpers/formatDate';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import React from 'react';
import Link from 'next/link';
import { BasicUser } from '@/interfaces/users/BasicUser';

const { Text } = Typography;

export const getInventoryUsersColumns = (t: (key: string) => string, user: BasicUser): ColumnsType<InventoryUser> => [
  {
    title: t('tables.avatar'),
    dataIndex: ['user', 'avatarUrl'],
    key: 'avatar',
    render: (url: string, record: InventoryUser) => (
      <Image preview={false} src={url || '/no-avatar.svg'} alt={record.name} width={50} height={50} />
    ),
  },
  {
    title: t('tables.name'),
    dataIndex: 'name',
    key: 'name',
    render: (_: any, record: InventoryUser) => {
      const name = user?.id === record.user?.id ? `${record?.name} (${t('tables.you')})` : record?.name;
      return (
        <Link href={`/users/${record.userId}`}>
          <Text ellipsis={{ tooltip: name }} className='inventory_info_table_user_name'>
            {name}
          </Text>
        </Link>
      );
    },
  },
  {
    title: t('tables.role'),
    dataIndex: 'role',
    key: 'role',
    render: (_: any, record: InventoryUser) => <Tag color='blue'>{record.role}</Tag>,
  },
  {
    title: t('tables.joined'),
    key: 'joined',
    dataIndex: 'createdAt',
    render: (_, record) => formatDate(record.createdAt),
  },
];
