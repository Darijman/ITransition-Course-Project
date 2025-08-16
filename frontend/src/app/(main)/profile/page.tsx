'use client';

import { Typography } from 'antd';
import { useTranslations } from 'next-intl';

const { Title } = Typography;

const Profile = () => {
  const t = useTranslations();

  return (
    <div>
      <Title level={1} style={{ textAlign: 'center', margin: '0px 0px 20px 0px' }}>
        {t('header.profile')}
      </Title>
    </div>
  );
};

export default Profile;