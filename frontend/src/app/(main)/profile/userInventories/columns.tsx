import { ColumnsType } from 'antd/es/table';
import { Inventory, InventoryStatuses } from '@/interfaces/inventories/Inventory';
import { Tag, Typography } from 'antd';
import { formatDate } from '@/helpers/formatDate';
import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

const { Text } = Typography;

export const columns: ColumnsType<Inventory> = [
  {
    title: 'Image',
    dataIndex: 'imageUrl',
    key: 'image',
    render: (url: string, record: Inventory) => (
      <Link href={`/inventories/${record.id}`} scroll={false}>
        <Image src={url || '/image-placeholder.svg'} alt={record.title} width={50} height={50} className='user_inventories_table_columns_image' />
      </Link>
    ),
  },
  {
    title: 'Title',
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
    title: 'Creator',
    dataIndex: ['creator', 'name'],
    key: 'creator',
    render: (_: any, record: Inventory) => (
      <Link href={`/users/${record?.creator?.id}`}>
        <Text className='user_inventories_table_columns_creator_name'>{record?.creator?.name}</Text>
      </Link>
    ),
  },
  {
    title: 'Items',
    dataIndex: 'items',
    key: 'items',
    render: (_: any, record: Inventory) => record.items?.length ?? 0,
  },
  {
    title: 'Category',
    dataIndex: ['category', 'title'],
    key: 'category',
    render: (_, record: Inventory) => {
      return (
        <Tag color='var(--category-color)' key={record?.category?.id}>
          {record?.category?.title}
        </Tag>
      );
    },
  },
  {
    title: 'Tags',
    key: 'tags',
    dataIndex: 'tags',
    render: (_, record: Inventory) => (
      <>
        {record?.tags?.map((tag) => {
          return (
            <Tag color='var(--tag-color)' key={tag.id}>
              {tag.title.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: 'Created',
    key: 'created',
    dataIndex: 'createdAt',
    render: (_, record) => {
      return formatDate(record.createdAt);
    },
  },
  {
    title: 'Status',
    key: 'status',
    dataIndex: 'status',
    render: (status: InventoryStatuses) => (
      <Tag color='var(--status-color)'>{status === InventoryStatuses.PUBLIC ? 'Public' : 'Private'}</Tag>
    ),
  },
];
