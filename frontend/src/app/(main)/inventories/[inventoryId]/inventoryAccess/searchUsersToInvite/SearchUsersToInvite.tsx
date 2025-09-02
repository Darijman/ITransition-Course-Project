'use client';

import { Typography } from 'antd';
import { InputField } from '@/components/inputField/InputField';
import { useTranslations } from 'next-intl';
import './searchUsersToInvite.css';

const { Title } = Typography;

export const SearchUsersToInvite = () => {
  const t = useTranslations();

  return (
    <div className='search_users_to_invite'>
      <div className='search_users_top'>
        <Title level={3} style={{ margin: '0px 0px 20px 0px' }}>
          {t('inventory.access.search')}
        </Title>
        <InputField placeHolder={t('inventory.access.search_users_placeholder')} />
      </div>
      <hr />
      <ul className='search_users_list'>
        <li>123</li>
        <li>123</li>
        <li>123</li>
      </ul>
    </div>
  );
};
