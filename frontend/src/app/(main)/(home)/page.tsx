'use client';

import { Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Inventory } from '@/interfaces/Inventory';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { InventoriesTable } from '@/components/inventoriesTable/InventoriesTable';
import { useRouter } from 'next/navigation';
import api from '../../../../axiosConfig';
import InventoryCard from '@/components/inventoryCard/InventoryCard';
import './home.css';
import { inventoryTableColumns } from './inventoriesTable.columns';

const { Title } = Typography;

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  console.log(`user.id`, user.id);

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

  return (
    <div>
      <Title level={1} style={{ textAlign: 'center', margin: '0px 0px 20px 0px' }}>
        {t('header.home')}
      </Title>

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

      <div>
        <InventoriesTable<Inventory>
          columns={inventoryTableColumns}
          rowKey='id'
          title={t('home.inventories_table_title')}
          pageLimit={20}
          searchKeys={['title', 'creator.name', 'tags.title', 'category.title']}
          showCreateButton
          onCreate={() => router.push('/inventories/new')}
        />
      </div>
    </div>
  );
}
