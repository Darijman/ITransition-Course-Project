'use client';

import { Button } from 'antd';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { InventoryItemLike } from '@/interfaces/InventoryItemLike';
import { motion } from 'framer-motion';

type Props = {
  itemId: number;
  likes: InventoryItemLike[];
  onToggleLike: (itemId: number, likeId?: number) => void;
  inventoryUserId?: number;
};

const MotionHeartFilled = motion(HeartFilled);
const MotionHeartOutlined = motion(HeartOutlined);

export const LikeButton = ({ itemId, likes, onToggleLike, inventoryUserId }: Props) => {
  const userLike = likes.find((like) => like.inventoryUserId === inventoryUserId);

  return (
    <Button
      onClick={() => onToggleLike(itemId, userLike?.id)}
      type='text'
      icon={
        userLike ? (
          <MotionHeartFilled
            style={{ color: 'red' }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1.1 }}
            whileTap={{ scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12 }}
          />
        ) : (
          <MotionHeartOutlined
            initial={{ scale: 0.9 }}
            animate={{ scale: 1.1 }}
            whileTap={{ scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12 }}
          />
        )
      }
    >
      {likes.length}
    </Button>
  );
};
