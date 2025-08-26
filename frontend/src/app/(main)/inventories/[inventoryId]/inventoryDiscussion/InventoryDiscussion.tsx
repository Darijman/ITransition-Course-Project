'use client';

import { Typography } from 'antd';
import './inventoryDiscussion.css';
import { useTranslations } from 'next-intl';
import { Inventory } from '@/interfaces/Inventory';
import { InventoryUser } from '@/interfaces/InventoryUser';
import { InventoryComment } from './inventoryComment/InventoryComment';
import { AddInventoryCommentForm } from './addInventoryCommentForm/AddInventoryCommentForm';

const { Title } = Typography;

interface Props {
  currentInventoryUser: InventoryUser | null;
  inventory: Inventory | null;
  setInventory: React.Dispatch<React.SetStateAction<Inventory | null>>;
}

export const InventoryDiscussion = ({ currentInventoryUser, inventory, setInventory }: Props) => {
  const t = useTranslations();

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
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {inventory?.comments?.map((comment) => {
          return <InventoryComment key={comment.id} inventoryComment={comment} />;
        })}
        <hr style={{ border: '1px solid var(--hover-color)', width: '100%' }} />
      </div>

      <div style={{ marginTop: 20 }}>
        <AddInventoryCommentForm />
      </div>
    </div>
  );
};
