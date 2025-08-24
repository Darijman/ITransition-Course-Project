'use client';

import { Button, notification, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Inventory } from '@/interfaces/Inventory';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { InventoriesTable } from '@/components/inventoriesTable/InventoriesTable';
import { useRouter } from 'next/navigation';
import { ArrowRightOutlined } from '@ant-design/icons';
import { inventoryTableColumns } from './inventoriesTable.columns';
import api from '../../../../axiosConfig';
import InventoryCard from '@/components/inventoryCard/InventoryCard';
import './home.css';

const { Title } = Typography;

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const [notificationApi, contextHolder] = notification.useNotification();

  const [topFiveInventories, setTopFiveInventories] = useState<Inventory[]>([]);
  const [fiveInventoriesErrorText, setFiveInventoriesErrorText] = useState<string>('');

  const getTopFiveInventories = useCallback(async () => {
    try {
      const response = await api.get<Inventory[]>(`/inventories/public/top`, { params: { limit: 5 } });
      setTopFiveInventories(response.data);
    } catch {
      setFiveInventoriesErrorText(t('home.top_inventories_error_text'));
    }
  }, [t]);

  useEffect(() => {
    getTopFiveInventories();
  }, [getTopFiveInventories]);

  useEffect(() => {
    const hasShown = sessionStorage.getItem('passwordNotificationShown');

    if (user.id && !user.hasPassword && !hasShown) {
      notificationApi.info({
        message: t('home.notification_password_message'),
        description: t('home.notification_password_description'),
        duration: 5,
        showProgress: true,
        actions: (
          <Button
            type='primary'
            iconPosition='end'
            icon={<ArrowRightOutlined />}
            onClick={() => {
              router.push('/profile/settings');
              notificationApi.destroy();
            }}
          >
            {t('home.go_to_profile_settings')}
          </Button>
        ),
      });

      sessionStorage.setItem('passwordNotificationShown', 'true');
    }
  }, [user, notificationApi, t, router]);

  console.log(`topFiveInventories`, topFiveInventories);
  

  return (
    <div>
      {contextHolder}
      <Title level={1} style={{ textAlign: 'center', margin: '0px 0px 20px 0px' }}>
        {t('header.home')}
      </Title>

      {topFiveInventories.length ? (
        <div className='home_top_five'>
          <Title level={3} style={{ textAlign: 'center', margin: '0px 0px 10px 0px', textTransform: 'capitalize' }}>
            {t('home.top_inventories_title')}
          </Title>
          {fiveInventoriesErrorText ? (
            <Title level={5} style={{ textAlign: 'center', color: 'var(--red-color)' }}>
              {fiveInventoriesErrorText}
            </Title>
          ) : (
            <div className='home_top_five_grid'>
              {topFiveInventories.map((inventory) => {
                return <InventoryCard key={inventory.id} inventory={inventory} />;
              })}
            </div>
          )}
        </div>
      ) : null}

      <div>
        <InventoriesTable<Inventory>
          columns={inventoryTableColumns}
          rowKey='id'
          title={t('home.inventories_table_title')}
          pageLimit={20}
          searchKeys={['title', 'creator.name', 'tags.title', 'category.title']}
          onCreate={() => router.push('/inventories/new')}
        />
      </div>
    </div>
  );
}
