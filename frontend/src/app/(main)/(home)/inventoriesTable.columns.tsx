import { ColumnsType } from 'antd/es/table';
import { Inventory } from '@/interfaces/Inventory';
import { Tag, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

export const inventoryTableColumns: ColumnsType<Inventory> = [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    render: (text: string) => (
      <Text style={{ maxWidth: 200 }} ellipsis={{ tooltip: text }}>
        {text}
      </Text>
    ),
  },
  {
    title: 'Creator',
    dataIndex: ['creator', 'name'],
    key: 'creator',
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
        <Tag color='gray' key={record?.category?.id}>
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
            <Tag color='#678aaf' key={tag.id}>
              {tag.title.toUpperCase()}
            </Tag>
          );
        })}
      </>
    ),
  },
  {
    title: 'Status',
    key: 'status',
    dataIndex: 'isPublic',
    render: (isPublic: boolean) => <Tag color='#595959'>{isPublic ? 'Public' : 'Private'}</Tag>,
  },
];
