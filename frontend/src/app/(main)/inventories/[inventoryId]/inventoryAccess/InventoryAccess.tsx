'use client';

import { Inventory, InventoryStatuses } from '@/interfaces/Inventory';
import { InventoryUser } from '@/interfaces/InventoryUser';
import { Button, Space, Tooltip, Typography } from 'antd';
import { useTranslations } from 'next-intl';

const { Title } = Typography;

interface Props {
  currentInventoryUser: InventoryUser | null;
  inventory: Inventory | null;
}

export const InventoryAccess = ({ currentInventoryUser, inventory }: Props) => {
  const t = useTranslations();


  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
        {t('inventory.access.title')}
      </Title>
      <div>
        <Space.Compact>
          <Tooltip title={t('inventories_new.status_tooltip_private')}>
            <Button
              type={inventory?.status === InventoryStatuses.PRIVATE ? 'primary' : 'default'}
              style={{ maxWidth: '250px', width: '100%', color: inventory?.status === InventoryStatuses.PRIVATE ? '#FFFFFF' : 'black' }}
              // onClick={() => setFieldsValue({ status: InventoryStatuses.PRIVATE })}
            >
              {t('inventories_new.private')}
            </Button>
          </Tooltip>
          <Tooltip title={t('inventories_new.status_tooltip_public')}>
            <Button
              type={inventory?.status === InventoryStatuses.PUBLIC ? 'primary' : 'default'}
              style={{ maxWidth: '250px', width: '100%', color: inventory?.status === InventoryStatuses.PUBLIC ? '#FFFFFF' : 'black' }}
              // onClick={() => setFieldsValue({ status: InventoryStatuses.PUBLIC })}
            >
              {t('inventories_new.public')}
            </Button>
          </Tooltip>
        </Space.Compact>
      </div>
    </div>
  );
};
