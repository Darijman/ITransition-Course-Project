import { ReactNode } from 'react';
import { AppstoreOutlined, CommentOutlined, SettingOutlined, UnlockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { InventoryItems } from './inventoryItems/InventoryItems';
import { InventoryUser } from '@/interfaces/InventoryUser';
import { InventoryInfo } from './inventoryInfo/InventoryInfo';
import { Inventory } from '@/interfaces/Inventory';
import { InventoryAccess } from './inventoryAccess/InventoryAccess';

interface TabItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
}

export const getTabs = (
  currentInventoryUser: InventoryUser | null,
  inventory: Inventory | null,
  setInventory: React.Dispatch<React.SetStateAction<Inventory | null>>,
): TabItem[] => [
  {
    key: '1',
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <AppstoreOutlined style={{ fontSize: '20px' }} />
        Items
      </span>
    ),
    children: <InventoryItems currentInventoryUser={currentInventoryUser} />,
  },
  {
    key: '2',
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <CommentOutlined style={{ fontSize: '20px' }} />
        Discussion
      </span>
    ),
    children: <div>Inventory Discussion</div>,
  },
  {
    key: '3',
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <SettingOutlined style={{ fontSize: '20px' }} />
        Settings
      </span>
    ),
    children: <div>Inventory Settings</div>,
  },
  {
    key: '4',
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <UnlockOutlined style={{ fontSize: '20px' }} />
        Access
      </span>
    ),
    children: <InventoryAccess inventory={inventory} setInventory={setInventory} currentInventoryUser={currentInventoryUser} />,
  },
  {
    key: '5',
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <InfoCircleOutlined style={{ fontSize: '20px' }} />
        Info
      </span>
    ),
    children: <InventoryInfo inventory={inventory} />,
  },
];
