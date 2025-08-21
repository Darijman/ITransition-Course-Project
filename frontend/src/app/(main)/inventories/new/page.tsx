'use client';

import { Typography } from 'antd';
import { useTranslations } from 'next-intl';
import { NewInventoryForm } from './newInventoryForm/NewInventoryForm';

const { Title } = Typography;

const NewInventoryPage = () => {
  const t = useTranslations();

  return (
    <div>
      <Title level={1} style={{ textAlign: 'center', margin: '0px 0px 20px 0px' }}>
        {t('header.new_inventory')}
      </Title>
      <NewInventoryForm />
    </div>
  );
};

export default NewInventoryPage;
