'use client';

import { useAuth } from '@/contexts/authContext/AuthContext';
import { Avatar } from 'antd';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <Avatar
        size={64}
        src={user?.avatarUrl}
        alt={user?.name}
      >
        {user?.name?.[0]} {/* Буква по имени, если аватарки нет */}
      </Avatar>
    </div>
  );
}
