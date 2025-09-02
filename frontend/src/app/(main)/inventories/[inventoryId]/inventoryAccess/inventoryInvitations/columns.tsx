import { ColumnsType } from 'antd/es/table';
import { Tag, Typography, Avatar } from 'antd';
import { formatDate } from '@/helpers/formatDate';
import { InventoryInvite } from '@/interfaces/inventories/InventoryInvite';
import React from 'react';
import Link from 'next/link';

const { Text } = Typography;

export const getInventoryInvitationColumns = (t: (key: string) => string): ColumnsType<InventoryInvite> => [
  {
    title: 'user',
    key: 'user',
    render: (_, record: InventoryInvite) => {
      let avatarUrl: string | null = null;
      let name: string | undefined;
      let email: string | undefined;
      let link: string | undefined;

      if (record.invitee) {
        avatarUrl = record.invitee.user?.avatarUrl ?? null;
        name = record.invitee.user?.name;
        email = record.invitee.user?.email;
        link = `/users/${record.invitee.user?.id}`;
      } else if (record.inviteeUser) {
        avatarUrl = record.inviteeUser.avatarUrl ?? null;
        name = record.inviteeUser.name;
        email = record.inviteeUser.email;
        link = `/users/${record.inviteeUser.id}`;
      } else {
        name = record.inviteeEmail;
        email = record.inviteeEmail;
      }

      const avatar = <Avatar src={avatarUrl || '/no-avatar.svg'} alt={name} style={{ marginRight: 8 }} />;

      const text = (
        <Text ellipsis={{ tooltip: `${name}${email ? ` (${email})` : ''}` }}>
          {name} {email && email !== name ? `(${email})` : ''}
        </Text>
      );

      const content = (
        <div className='inventations_table_columns_user'>
          {avatar}
          {text}
        </div>
      );

      return link ? <Link href={link}>{content}</Link> : content;
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
