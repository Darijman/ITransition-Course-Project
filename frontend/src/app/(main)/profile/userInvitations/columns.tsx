import { ColumnsType } from 'antd/es/table';
import { Tag, Typography } from 'antd';
import { formatDate } from '@/helpers/formatDate';
import { InventoryInvite } from '@/interfaces/inventories/InventoryInvite';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

const { Text } = Typography;

export const columns: ColumnsType<InventoryInvite> = [
  {
    title: 'Image',
    dataIndex: ['inventory', 'imageUrl'],
    key: 'image',
    render: (url: string, record: InventoryInvite) => (
      <Link href={`/inventories/${record.inventory?.id}`} scroll={false}>
        <Image src={url || '/image-placeholder.svg'} alt='Inventory' width={50} height={50} className='inventations_table_columns_image' />
      </Link>
    ),
  },
  {
    title: 'Title',
    dataIndex: ['inventory', 'title'],
    key: 'title',
    render: (text: string, record: InventoryInvite) => (
      <Link href={`/inventories/${record.inventory?.id}`}>
        <Text className='inventations_table_columns_title' ellipsis={{ tooltip: text }}>
          {text}
        </Text>
      </Link>
    ),
  },
  {
    title: 'Creator',
    key: 'creator',
    render: (_: any, record: InventoryInvite) => (
      <Link href={`/users/${record.inventory?.creator?.id}`}>
        <Text className='inventations_table_columns_creator_name'>{record.inventory?.creator?.name}</Text>
      </Link>
    ),
  },
  {
    title: 'Category',
    key: 'category',
    render: (_, record: InventoryInvite) => {
      return (
        <Tag color='var(--category-color)' key={record.inventory?.category?.id}>
          {record.inventory?.category?.title || '-'}
        </Tag>
      );
    },
  },
  {
    title: 'Your role',
    key: 'role',
    render: (_, record: InventoryInvite) => <Tag color='var(--tag-color)'>{record.role}</Tag>,
  },
  {
    title: 'Expires',
    key: 'expires',
    dataIndex: 'expiresAt',
    render: (_, record: InventoryInvite) => formatDate(record.expiresAt),
  },
  {
    title: 'Status',
    key: 'status',
    dataIndex: 'status',
    render: (status: string) => {
      const color = ['ACCEPTED', 'PENDING'].includes(status) ? 'gray' : 'red';
      return <Tag color={color}>{status}</Tag>;
    },
  },
];
