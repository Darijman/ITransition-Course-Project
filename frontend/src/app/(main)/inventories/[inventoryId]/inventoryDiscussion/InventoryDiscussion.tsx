'use client';

import { useEffect, useRef } from 'react';
import { Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { Inventory } from '@/interfaces/inventories/Inventory';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { InventoryComment } from './inventoryComment/InventoryComment';
import { AddInventoryCommentForm } from './addInventoryCommentForm/AddInventoryCommentForm';
import { canModifyInventory } from '@/helpers/canModifyInventory';
import { useAuth } from '@/contexts/authContext/AuthContext';
import './inventoryDiscussion.css';

const { Title } = Typography;

interface Props {
  currentInventoryUser: InventoryUser | null;
  inventory: Inventory | null;
  lastCommentIdRef: React.RefObject<number | null>;
}

export const InventoryDiscussion = ({ currentInventoryUser, inventory, lastCommentIdRef }: Props) => {
  const { user } = useAuth();
  const t = useTranslations();

  const commentRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (lastCommentIdRef.current) {
      const el = commentRefs.current[lastCommentIdRef.current];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      lastCommentIdRef.current = null;
    }
  }, [inventory?.comments?.length, lastCommentIdRef]);

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
        {t('inventory.discussion.title')}
      </Title>
      <hr style={{ border: '1px solid var(--hover-color)', width: '100%' }} />

      <div
        style={{
          overflowY: 'scroll',
          maxHeight: '500px',
          height: '100%',
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
        {inventory?.comments?.length ? <hr style={{ border: '1px solid var(--hover-color)', width: '100%' }} /> : null}
      </div>

      {canModifyInventory(currentInventoryUser, user) ? (
        <div style={{ marginTop: 20 }}>
          <AddInventoryCommentForm inventory={inventory} currentInventoryUser={currentInventoryUser} />
        </div>
      ) : null}
    </div>
  );
};
