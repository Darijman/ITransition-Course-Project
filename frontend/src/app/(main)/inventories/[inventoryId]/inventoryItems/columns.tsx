import { ColumnsType } from 'antd/es/table';
import { InventoryItem } from '@/interfaces/InventoryItem';
import { Typography, Image } from 'antd';
import { formatDate } from '@/helpers/formatDate';
import React from 'react';
import Link from 'next/link';

const { Text } = Typography;

export const inventoryItemsColumns: ColumnsType<InventoryItem> = [
  {
    title: 'Image',
    dataIndex: 'imageUrl',
    key: 'image',
    render: (url: string, record: InventoryItem) => (
      <Image
        src={url || '/image-placeholder.svg'}
        alt={record.title}
        width={50}
        height={50}
        className='items_table_columns_image'
      />
    ),
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    render: (text: string) => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
  },
  {
    title: 'Creator',
    dataIndex: ['creator', 'name'],
    key: 'creator',
    render: (_: any, record: InventoryItem) => (
      <Link href={`/users/${record?.creator?.id}`}>
        <Text className='items_table_columns_creator_name'>{record?.creator?.name}</Text>
      </Link>
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
];
