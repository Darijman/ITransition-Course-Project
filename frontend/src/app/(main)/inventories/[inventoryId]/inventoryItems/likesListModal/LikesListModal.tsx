'use client';

import { Modal, List, Avatar, Typography } from 'antd';
import { InventoryItemLike } from '@/interfaces/inventories/InventoryItemLike';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import './likesListModal.css';

const { Text } = Typography;

type Props = {
  open: boolean;
  onClose: () => void;
  likes: InventoryItemLike[];
};

export const LikesListModal = ({ open, onClose, likes }: Props) => {
  const t = useTranslations();

  return (
    <Modal
      className='likes_list_modal'
      open={open}
      onCancel={onClose}
      footer={null}
      title={`${t('inventory.items.liked_by')} (${likes?.length ?? 0})`}
    >
      <List
        dataSource={likes}
        locale={{ emptyText: 'No likes yet' }}
        renderItem={(like) => {
          const iu = like.inventoryUser;
          const user = iu?.user;
          const username = user?.name ?? iu?.name ?? 'Unknown User';
          const userId = user?.id;

          return (
            <List.Item key={like.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href={`/users/${userId}`}>
                  <Avatar
                    className='likes_list_modal_avatar'
                    size={48}
                    src={user?.avatarUrl || '/no-avatar.svg'}
                    style={{ cursor: 'pointer' }}
                  />
                </Link>

                <Link href={`/users/${userId}`} style={{ textDecoration: 'none' }}>
                  <Text className='likes_list_username'>{username}</Text>
                </Link>
              </div>
            </List.Item>
          );
        }}
      />
    </Modal>
  );
};
