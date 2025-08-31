'use client';

import { Badge, Avatar } from 'antd';
import { useNotifications } from '@/contexts/notificationContext/NotificationContext';
import { useAuth } from '@/contexts/authContext/AuthContext';

export const HeaderAvatar = () => {
  const { user } = useAuth();
  const { unreadCounts } = useNotifications();

  return (
    <Badge count={unreadCounts.TOTAL} overflowCount={99}>
      <Avatar
        className={`header_avatar ${!user?.avatarUrl ? 'header_avatar_no_image' : ''}`}
        size={40}
        src={user?.avatarUrl || '/no-avatar.svg'}
      >
        {!user?.avatarUrl && user?.name?.[0]?.toUpperCase()}
      </Avatar>
    </Badge>
  );
};

