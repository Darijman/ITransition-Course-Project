'use client';

import { Avatar, Typography } from 'antd';
import { InventoryComment as IInventoryComment } from '@/interfaces/InventoryComment';
import Link from 'next/link';
import './inventoryComment.css';
import { formatDate } from '@/helpers/formatDate';

const { Title, Text, Paragraph } = Typography;

interface Props {
  inventoryComment: IInventoryComment;
}

export const InventoryComment = ({ inventoryComment }: Props) => {
  const { text, author, createdAt } = inventoryComment;

  const avatarUrl = author?.user?.avatarUrl || '';
  const authorName = author?.name || author?.user?.name || '?';

  return (
    <div className='inventory_comment'>
      <Link href={`/users/${author?.user?.id || ''}`}>
        <Avatar
          style={{ marginRight: '20px', flexShrink: 0 }}
          className={`comment_avatar ${!avatarUrl ? 'comment_avatar_no_image' : ''}`}
          size={50}
          src={avatarUrl || '/no-avatar.svg'}
        >
          {!avatarUrl && authorName[0]?.toUpperCase()}
        </Avatar>
      </Link>

      <div>
        <div className='inventory_comment_header'>
          <Title level={5} style={{ margin: 0 }}>
            {authorName}
          </Title>
          <Text style={{ margin: 0 }} type='secondary'>
            {formatDate(createdAt)}
          </Text>
        </div>

        <Paragraph>{text}</Paragraph>
      </div>
    </div>
  );
};
