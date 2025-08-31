import { ColumnsType } from 'antd/es/table';
import { Typography, Image, Tag } from 'antd';
import { formatDate } from '@/helpers/formatDate';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import React from 'react';
import Link from 'next/link';

const { Text } = Typography;

export const inventoryUsersColumns: ColumnsType<InventoryUser> = [
  {
    title: 'Avatar',
    dataIndex: ['user', 'avatarUrl'],
    key: 'avatar',
    render: (url: string, record: InventoryUser) => (
      <Image preview={false} src={url || '/no-avatar.svg'} alt={record.name} width={50} height={50} />
    ),
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string, record: InventoryUser) => (
      <Link href={`/users/${record.userId}`}>
        <Text ellipsis={{ tooltip: text }} className='inventory_info_table_user_name'>
          {text}
        </Text>
      </Link>
    ),
  },

  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    render: (_: any, record: InventoryUser) => <Tag color='blue'>{record.role}</Tag>,
  },
  {
    title: 'Joined',
    key: 'joined',
    dataIndex: 'createdAt',
    render: (_, record) => formatDate(record.createdAt),
  },
];
