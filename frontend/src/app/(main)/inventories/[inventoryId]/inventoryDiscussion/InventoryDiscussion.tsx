'use client';

import { useEffect, useRef } from 'react';
import { Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { Inventory } from '@/interfaces/Inventory';
import { InventoryUser } from '@/interfaces/InventoryUser';
import { InventoryComment } from './inventoryComment/InventoryComment';
import { AddInventoryCommentForm } from './addInventoryCommentForm/AddInventoryCommentForm';
import { useSocket } from '@/contexts/socketContext/SocketContext';
import './inventoryDiscussion.css';

const { Title } = Typography;

interface Props {
  currentInventoryUser: InventoryUser | null;
  inventory: Inventory | null;
  setInventory: React.Dispatch<React.SetStateAction<Inventory | null>>;
}

export const InventoryDiscussion = ({ currentInventoryUser, inventory, setInventory }: Props) => {
  const { socket } = useSocket();
  const t = useTranslations();

  const commentRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const lastCommentIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!socket || !inventory?.id) return;

    socket.on('inventory-comment-created', (newComment) => {
      lastCommentIdRef.current = newComment.id;

      setInventory((prev) => {
        if (!prev) return prev;

        if (prev.comments?.some((c) => c.id === newComment.id)) {
          return prev;
        }

        return {
          ...prev,
          comments: [...(prev.comments ?? []), newComment],
        };
      });
    });

    return () => {
      socket.off('inventory-comment-created');
    };
  }, [socket, inventory?.id, setInventory]);

  useEffect(() => {
    if (lastCommentIdRef.current) {
      const el = commentRefs.current[lastCommentIdRef.current];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      lastCommentIdRef.current = null;
    }
  }, [inventory?.comments?.length]);

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
        {t('inventory.discussion.title')}
      </Title>
      <hr style={{ border: '1px solid var(--hover-color)', width: '100%' }} />

      <div
        style={{
          overflowY: 'scroll',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {inventory?.comments?.map((comment) => (
          <InventoryComment
            key={comment.id}
            ref={(el) => {
              commentRefs.current[comment.id] = el;
            }}
            inventoryComment={comment}
            currentInventoryUser={currentInventoryUser}
          />
        ))}
        <hr style={{ border: '1px solid var(--hover-color)', width: '100%' }} />
      </div>

      <div style={{ marginTop: 20 }}>
        <AddInventoryCommentForm inventory={inventory} currentInventoryUser={currentInventoryUser} />
      </div>
    </div>
  );
};
