import { ReactNode } from 'react';
import { AppstoreOutlined, CommentOutlined, SettingOutlined, UnlockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { InventoryItems } from './inventoryItems/InventoryItems';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { Inventory } from '@/interfaces/inventories/Inventory';
import { InventoryAccess } from './inventoryAccess/InventoryAccess';
import { UserRoles } from '@/interfaces/users/UserRoles.enum';
import { InventoryUserRoles } from '@/interfaces/inventories/InventoryUserRoles';
import { InventoryInfo } from './inventoryInfo/InventoryInfo';
import { InventoryDiscussion } from './inventoryDiscussion/InventoryDiscussion';

interface TabItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
}
export const getTabs = (
  currentInventoryUser: InventoryUser | null,
  inventory: Inventory | null,
  setInventory: React.Dispatch<React.SetStateAction<Inventory | null>>,
  userRole: UserRoles,
  t: (key: string, values?: Record<string, any>) => string,
): TabItem[] => {
  const tabs: TabItem[] = [
    {
      key: '1',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AppstoreOutlined style={{ fontSize: '20px' }} />
          {t('inventory.tabs.items')}
        </span>
      ),
      children: <InventoryItems currentInventoryUser={currentInventoryUser} />,
    },
    {
      key: '2',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CommentOutlined style={{ fontSize: '20px' }} />
          {t('inventory.tabs.discussion')}
        </span>
      ),
      children: <InventoryDiscussion currentInventoryUser={currentInventoryUser} inventory={inventory} setInventory={setInventory} />,
    },
    {
      key: 'info',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <InfoCircleOutlined style={{ fontSize: '20px' }} />
          {t('inventory.tabs.info')}
        </span>
      ),
      children: <InventoryInfo inventory={inventory} />,
    },
  ];

  if (userRole === UserRoles.ADMIN || currentInventoryUser?.role === InventoryUserRoles.CREATOR) {
    tabs.splice(2, 0, {
      key: '3',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SettingOutlined style={{ fontSize: '20px' }} />
          {t('inventory.tabs.settings')}
        </span>
      ),
      children: <div>Inventory Settings</div>,
    });
  }

  if (userRole === UserRoles.ADMIN || currentInventoryUser?.role === InventoryUserRoles.CREATOR) {
    tabs.splice(3, 0, {
      key: '4',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UnlockOutlined style={{ fontSize: '20px' }} />
          {t('inventory.tabs.access')}
        </span>
      ),
      children: <InventoryAccess inventory={inventory} setInventory={setInventory} currentInventoryUser={currentInventoryUser} />,
    });
  }
  return tabs;
};
