'use client';

import { Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Inventory } from '@/interfaces/Inventory';
import { useAuth } from '@/contexts/authContext/AuthContext';
import api from '../../../../axiosConfig';
import InventoryCard from '@/components/inventoryCard/InventoryCard';
import './home.css';

const { Title } = Typography;

export default function Home() {
  const { user } = useAuth();
  const t = useTranslations();

  const [topFiveInventories, setTopFiveInventories] = useState<Inventory[]>([]);

  const getTopFiveInventories = useCallback(async () => {
    if (!user.id) return;

    try {
      const response = await api.get<Inventory[]>(`/inventories/public`);
      setTopFiveInventories(response.data);
    } catch (error: any) {
      console.log(`error`, error);
    }
  }, [user.id]);

  useEffect(() => {
    getTopFiveInventories();
  }, [getTopFiveInventories]);

  console.log(`topFiveInventories`, topFiveInventories);

  return (
    <div>
      <Title level={1} style={{ textAlign: 'center', margin: '0px 0px 20px 0px' }}>
        {t('header.home')}
      </Title>
      <div className='home_top_five'>
        <Title level={3} style={{ textAlign: 'center', margin: 0, textTransform: 'capitalize' }}>
          Top Popular Inventories
        </Title>
        <div className='home_top_five_grid'>
          {topFiveInventories.map((inventory) => {
            return <InventoryCard key={inventory.id} inventory={inventory} />;
          })}
        </div>
      </div>
    </div>
  );
}
