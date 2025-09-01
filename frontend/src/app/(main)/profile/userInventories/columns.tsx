import { ColumnsType } from 'antd/es/table';
import { Inventory, InventoryStatuses } from '@/interfaces/inventories/Inventory';
import { Tag, Typography } from 'antd';
import { formatDate } from '@/helpers/formatDate';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

export interface ExtendedInventory extends Inventory {
  joinedAt: string;
}

const { Text } = Typography;

export const getColumns = (t: (key: string) => string): ColumnsType<ExtendedInventory> => [
  {
    title: t('tables.image'),
    dataIndex: 'imageUrl',
    key: 'image',
    render: (url: string, record: Inventory) => (
      <Link href={`/inventories/${record.id}`} scroll={false}>
        <Image
          src={url || '/image-placeholder.svg'}
          alt={record.title}
          width={50}
          height={50}
          className='user_inventories_table_columns_image'
        />
      </Link>
    ),
  },
  {
    title: t('tables.title'),
    dataIndex: 'title',
    key: 'title',
    render: (text: string, record: Inventory) => (
      <Link href={`/inventories/${record.id}`}>
        <Text className='user_inventories_table_columns_title' ellipsis={{ tooltip: text }}>
          {text}
        </Text>
      </Link>
    ),
  },
  {
    title: t('tables.creator'),
    dataIndex: ['creator', 'name'],
    key: 'creator',
    render: (_: any, record: Inventory) => (
      <Link href={`/users/${record?.creator?.id}`}>
        <Text className='user_inventories_table_columns_creator_name'>{record?.creator?.name}</Text>
      </Link>
    ),
  },
  {
    title: t('tables.items'),
    dataIndex: 'items',
    key: 'items',
    render: (_: any, record: Inventory) => record.items?.length ?? 0,
  },
  {
    title: t('tables.category'),
    dataIndex: ['category', 'title'],
    key: 'category',
    render: (_, record: Inventory) => (
      <Tag color='var(--category-color)' key={record?.category?.id}>
        {record?.category?.title}
      </Tag>
    ),
  },
  {
    title: t('tables.tags'),
    key: 'tags',
    dataIndex: 'tags',
    render: (_, record: Inventory) => (
      <>
        {record?.tags?.map((tag) => (
          <Tag color='var(--tag-color)' key={tag.id}>
            {tag.title.toUpperCase()}
          </Tag>
        ))}
      </>
    ),
  },
  {
    title: t('tables.joined'),
    key: 'joinedAt',
    dataIndex: 'joinedAt',
    render: (_, record: Inventory & { joinedAt: string }) => formatDate(record.joinedAt),
  },
  {
    title: t('tables.status'),
    key: 'status',
    dataIndex: 'status',
    render: (status: InventoryStatuses) => (
      <Tag color='var(--status-color)'>
        {status === InventoryStatuses.PUBLIC ? t('inventories_new.public') : t('inventories_new.private')}
      </Tag>
    ),
  },
];
