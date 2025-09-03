import { ColumnsType } from 'antd/es/table';
import { Tag, Typography, Image } from 'antd';
import { formatDate } from '@/helpers/formatDate';
import { InventoryInvite } from '@/interfaces/inventories/InventoryInvite';
import React from 'react';
import Link from 'next/link';

const { Text } = Typography;

export const getInventoryInvitationColumns = (t: (key: string) => string): ColumnsType<InventoryInvite> => [
  {
    title: t('tables.avatar'),
    dataIndex: ['user', 'avatarUrl'],
    key: 'avatar',
    render: (url: string, record: InventoryInvite) => (
      <Image preview={false} src={url || '/no-avatar.svg'} alt={record.inviteeUser?.name} width={50} height={50} />
    ),
  },
  {
    title: t('tables.name'),
    key: 'name',
    width: 300,
    render: (_, record: InventoryInvite) => {
      return (
        <Link href={`/users/${record.inviteeUser?.id}`}>
          <Text className='inventory_invitations_user_name' >{record.inviteeUser?.name}</Text>
        </Link>
      );
    },
  },
  {
    title: t('tables.invited_as'),
    key: 'role',
    render: (_, record: InventoryInvite) => <Tag color='var(--tag-color)'>{record.role}</Tag>,
  },
  {
    title: t('tables.expires'),
    key: 'expires',
    dataIndex: 'expiresAt',
    render: (_, record: InventoryInvite) => formatDate(record.expiresAt),
  },
  {
    title: t('tables.status'),
    key: 'status',
    dataIndex: 'status',
    render: (status: string) => {
      const color = status === 'ACCEPTED' ? 'green' : status === 'PENDING' ? 'blue' : 'red';
      return <Tag color={color}>{status}</Tag>;
    },
  },
];
