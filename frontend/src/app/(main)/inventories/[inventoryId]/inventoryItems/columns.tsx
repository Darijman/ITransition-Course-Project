import { ColumnsType } from 'antd/es/table';
import { InventoryItem } from '@/interfaces/inventories/InventoryItem';
import { Typography, Image, Button, Popover } from 'antd';
import { formatDate } from '@/helpers/formatDate';
import { LikeButton } from './likeButton/LikeButton';
import Link from 'next/link';

const { Text, Paragraph } = Typography;

export const getInventoryItemsColumns = (
  t: (key: string) => string,
  handleToggleLike: (itemId: number, likeId?: number) => void,
  inventoryUserId?: number,
  handleOpenLikesModal?: (itemId: number) => void,
): ColumnsType<InventoryItem> => [
  {
    title: t('tables.image'),
    dataIndex: 'imageUrl',
    key: 'image',
    render: (url: string, record: InventoryItem) => <Image src={url || '/image-placeholder.svg'} alt={record.title} width={50} height={50} />,
  },
  {
    title: t('tables.likes'),
    key: 'likes',
    render: (_, record: InventoryItem) => {
      const likes = record.likes ?? [];

      const likeButton = <LikeButton itemId={record.id} likes={likes} onToggleLike={handleToggleLike} inventoryUserId={inventoryUserId} />;

      if (!likes.length) {
        return <div style={{ display: 'inline-block' }}>{likeButton}</div>;
      }

      return (
        <Popover
          content={
            <Button
              type='text'
              style={{ padding: 0 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOpenLikesModal?.(record.id);
              }}
            >
              {t('inventory.items.view_all_likes')} ({likes.length})
            </Button>
          }
          trigger='hover'
          mouseEnterDelay={0.5}
          getPopupContainer={() => document.body}
        >
          <div style={{ display: 'inline-block' }}>{likeButton}</div>
        </Popover>
      );
    },
  },
  {
    title: t('tables.title'),
    dataIndex: 'title',
    key: 'title',
    render: (text: string) => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
  },
  {
    title: t('tables.description'),
    dataIndex: 'description',
    key: 'description',
    width: 400,
    render: (text: string) => (
      <Paragraph style={{ margin: 0, maxWidth: '400px' }} ellipsis={{ tooltip: text }}>
        {text}
      </Paragraph>
    ),
  },
  {
    title: t('tables.creator'),
    dataIndex: ['creator', 'name'],
    key: 'creator',
    render: (_: any, record: InventoryItem) => (
      <Link href={`/users/${record?.creator?.id}`}>
        <Text className='items_table_columns_creator_name'>{record?.creator?.name}</Text>
      </Link>
    ),
  },
  {
    title: t('tables.created'),
    key: 'created',
    dataIndex: 'createdAt',
    render: (_, record) => formatDate(record.createdAt),
  },
];
