'use client';

import { forwardRef, useState } from 'react';
import { useLocale } from '@/contexts/localeContext/LocaleContext';
import { Avatar, Button, Typography, Popconfirm, message } from 'antd';
import { InventoryComment as IInventoryComment } from '@/interfaces/inventories/InventoryComment';
import { formatDate } from '@/helpers/formatDate';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { UserRoles } from '@/interfaces/users/UserRoles.enum';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import Link from 'next/link';
import api from '../../../../../../../axiosConfig';
import './inventoryComment.css';

const { Title, Text, Paragraph } = Typography;

interface Props {
  inventoryComment: IInventoryComment;
  currentInventoryUser: InventoryUser | null;
}

export const InventoryComment = forwardRef<HTMLDivElement, Props>(({ inventoryComment, currentInventoryUser }, ref) => {
  const { id } = inventoryComment;
  const { user } = useAuth();
  const { locale } = useLocale();
  const { text, author, authorId, createdAt } = inventoryComment;

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const avatarUrl = author?.user?.avatarUrl || '';
  const authorName = author?.name || author?.user?.name || '?';

  const canModifyComment: boolean =
    user.role === UserRoles.ADMIN || currentInventoryUser?.role === InventoryUserRoles.CREATOR || currentInventoryUser?.id === authorId;

  const deleteCommentHandler = async () => {
    if (!canModifyComment || !inventoryComment.id) return;

    try {
      await api.delete(`/inventory_comments/${id}`);
    } catch {
      messageApi.error({
        content: 'Failed to delete comment! Try again later..',
      });
    }
  };

  return (
    <div ref={ref} className='inventory_comment'>
      {contextHolder}

      <Link style={{ marginRight: 20 }} href={`/users/${author?.user?.id || ''}`}>
        <Avatar
          style={{ flexShrink: 0 }}
          className={`comment_avatar ${!avatarUrl ? 'comment_avatar_no_image' : ''}`}
          size={50}
          src={avatarUrl || '/no-avatar.svg'}
        >
          {!avatarUrl && authorName[0]?.toUpperCase()}
        </Avatar>
      </Link>

      <div style={{ width: '100%' }}>
        <div className='inventory_comment_header'>
          <Title level={5} style={{ margin: 0 }}>
            {authorName}
          </Title>
          <div>
            {canModifyComment ? (
              <div className='inventory_comment_buttons'>
                <Popconfirm
                  title={
                    locale === 'en'
                      ? 'This action is irreversible. Are you sure you want to delete?'
                      : 'Это действие необратимо. Вы уверены, что хотите удалить?'
                  }
                  onConfirm={deleteCommentHandler}
                  open={isDeleting}
                  onOpenChange={(visible) => setIsDeleting(visible)}
                  okText={locale === 'en' ? 'Yes, delete!' : 'Да, удалить!'}
                  cancelText={locale === 'en' ? 'Cancel' : 'Отмена'}
                  placement='topLeft'
                  getPopupContainer={() => document.body}
                  okButtonProps={{ danger: true, style: { backgroundColor: 'red', borderColor: 'red' } }}
                  cancelButtonProps={{ style: { backgroundColor: 'var(--secondary-text-color)', color: '#FFFFFF' } }}
                >
                  <Button className='inventory_comment_delete_button' type='text' icon={<DeleteOutlined style={{ fontSize: '20px' }} />} />
                </Popconfirm>
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
