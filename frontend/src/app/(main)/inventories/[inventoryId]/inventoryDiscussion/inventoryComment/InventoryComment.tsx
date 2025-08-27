'use client';

import { forwardRef } from 'react';
import { Avatar, Button, Typography } from 'antd';
import { InventoryComment as IInventoryComment } from '@/interfaces/InventoryComment';
import { formatDate } from '@/helpers/formatDate';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { UserRoles } from '@/interfaces/UserRoles.enum';
import { InventoryUser } from '@/interfaces/InventoryUser';
import { InventoryUserRoles } from '@/interfaces/InventoryUserRoles';
import Link from 'next/link';
import './inventoryComment.css';

const { Title, Text, Paragraph } = Typography;

interface Props {
  inventoryComment: IInventoryComment;
  currentInventoryUser: InventoryUser | null;
}

export const InventoryComment = forwardRef<HTMLDivElement, Props>(({ inventoryComment, currentInventoryUser }, ref) => {
  const { user } = useAuth();
  const { text, author, authorId, createdAt } = inventoryComment;

  const avatarUrl = author?.user?.avatarUrl || '';
  const authorName = author?.name || author?.user?.name || '?';
  const canEditComment: boolean =
    user.role === UserRoles.ADMIN || currentInventoryUser?.role === InventoryUserRoles.CREATOR || currentInventoryUser?.id === authorId;

  return (
    <div ref={ref} className='inventory_comment'>
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
          <div>
            {canEditComment ? (
              <div className='inventory_comment_buttons'>
                <Button className='inventory_comment_delete_button' type='text' icon={<DeleteOutlined style={{ fontSize: '20px' }} />} />
                <Button className='inventory_comment_edit_button' type='text' icon={<EditOutlined style={{ fontSize: '20px' }} />} />
              </div>
            ) : null}
            <Text style={{ margin: 0 }} type='secondary'>
              {formatDate(createdAt)}
            </Text>
          </div>
        </div>

        <Paragraph>{text}</Paragraph>
      </div>
    </div>
  );
});

InventoryComment.displayName = 'InventoryComment';
