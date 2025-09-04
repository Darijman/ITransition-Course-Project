'use client';

import { forwardRef, useState } from 'react';
import { useLocale } from '@/contexts/localeContext/LocaleContext';
import { Avatar, Button, Typography, Popconfirm, message } from 'antd';
import { InventoryComment as IInventoryComment } from '@/interfaces/inventories/InventoryComment';
import { formatDate } from '@/helpers/formatDate';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { TextField } from '@/components/textField/TextField';
import { useTranslations } from 'next-intl';
import { canModifyInventory } from '@/helpers/canModifyInventory';
import Link from 'next/link';
import api from '../../../../../../../axiosConfig';
import './inventoryComment.css';

const { Title, Text, Paragraph } = Typography;

interface Props {
  inventoryComment: IInventoryComment;
  currentInventoryUser: InventoryUser | null;
}

export const InventoryComment = forwardRef<HTMLDivElement, Props>(({ inventoryComment, currentInventoryUser }, ref) => {
  const { user } = useAuth();
  const t = useTranslations();

  const { id } = inventoryComment;
  const { locale } = useLocale();
  const { text, author, createdAt, updatedAt } = inventoryComment;

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedText, setEditedText] = useState<string>(text);

  const avatarUrl = author?.user?.avatarUrl || '';
  const authorName = author?.name || author?.user?.name || '?';
  const isEdited = new Date(updatedAt).getTime() > new Date(createdAt).getTime();

  const deleteCommentHandler = async () => {
    if (!canModifyInventory(currentInventoryUser, user) || !inventoryComment.id) return;

    try {
      await api.delete(`/inventory_comments/${id}`);
    } catch {
      messageApi.error({
        content: 'Failed to delete comment! Try again later..',
      });
    }
  };

  const saveEditHandler = async () => {
    if (!canModifyInventory(currentInventoryUser, user) || !inventoryComment.id) return;

    try {
      await api.put(`/inventory_comments/${id}`, { text: editedText });
      setIsEditing(false);
    } catch {
      messageApi.error({
        content: t('inventory.discussion.failed_to_edit_comment'),
      });
      setIsEditing(false);
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
            {canModifyInventory(currentInventoryUser, user) ? (
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
                <Button
                  onClick={() => setIsEditing((prev) => !prev)}
                  className='inventory_comment_edit_button'
                  type='text'
                  icon={<EditOutlined style={{ fontSize: '20px' }} />}
                />
              </div>
            ) : null}
            <Text style={{ margin: 0 }} type='secondary'>
              {formatDate(createdAt)} {isEdited && '(Edited)'}
            </Text>
          </div>
        </div>

        {isEditing ? (
          <div style={{ marginTop: 8 }}>
            <TextField value={editedText} onChange={(e: any) => setEditedText(e.target.value)} maxLength={255} minLength={1} showCount />
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <Button
                className='inventory_comment_save_edit_button'
                type='primary'
                onClick={saveEditHandler}
                disabled={text.trim() === editedText.trim() || !editedText.trim()}
              >
                {t('inventory.discussion.save_edit')}
              </Button>
              <Button
                className='inventory_comment_cancel_edit_button'
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(text);
                }}
              >
                {t('inventory.discussion.cancel_edit')}
              </Button>
            </div>
          </div>
        ) : (
          <Paragraph>{text}</Paragraph>
        )}
      </div>
    </div>
  );
});

InventoryComment.displayName = 'InventoryComment';
