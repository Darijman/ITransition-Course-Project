'use client';

import { Card, Tag, Avatar, Typography, Space, Tooltip } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { Inventory, InventoryStatuses } from '@/interfaces/Inventory';
import Link from 'next/link';
import Image from 'next/image';
import './inventoryCard.css';

const { Meta } = Card;
const { Text, Paragraph } = Typography;

interface InventoryCardProps {
  inventory: Inventory;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ inventory }) => {
  const imageSrc = inventory.imageUrl && inventory.imageUrl.trim().length > 0 ? inventory.imageUrl : undefined;
  const avatarSrc = inventory.creator?.avatarUrl && inventory.creator.avatarUrl.trim().length > 0 ? inventory.creator.avatarUrl : undefined;

  console.log(`inventory`, inventory);

  return (
    <Card
      className='inventory_card'
      cover={
        <div className='cover_wrap'>
          {imageSrc ? (
            <Image alt={inventory.title} src={imageSrc || '/inventory-placeholder.svg'} width={300} height={200} className='cover_img' />
          ) : (
            <div className='cover_placeholder'>
              <AppstoreOutlined className='cover_icon' />
            </div>
          )}
        </div>
      }
    >
      <Meta
        avatar={
          <Link href={`/users/${inventory.creator?.id}`}>
            <Avatar className='inventory_card_avatar' size={40} src={avatarSrc || '/no-avatar.svg'} />
          </Link>
        }
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Tooltip title={inventory.title}>
                <Text className='inventory_card_title' ellipsis={{ tooltip: inventory.title }}>
                  {inventory.title}
                </Text>
              </Tooltip>
            </div>
            <Tag color='#595959' style={{ marginLeft: 8 }}>
              {inventory.status === InventoryStatuses.PUBLIC ? 'Public' : 'Private'}
            </Tag>
          </div>
        }
        description={
          <div className='meta'>
            <Space size={8} wrap>
              {inventory.category?.title && <Tag color='gray'>{inventory?.category.title}</Tag>}

              <Text>{inventory?.items?.length ?? 0} items</Text>

              {inventory.creator?.name && (
                <Link href={`/users/${inventory.creator.id}`}>
                  <Text className='inventory_card_creator_name'>· by {inventory.creator.name}</Text>
                </Link>
              )}
            </Space>
            {inventory.description && (
              <Paragraph style={{ marginTop: 10 }} type='secondary' ellipsis={{ rows: 2 }}>
                {inventory.description}
              </Paragraph>
            )}
          </div>
        }
      />
    </Card>
  );
};

export default InventoryCard;
