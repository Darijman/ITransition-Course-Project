'use client';

import { Typography } from 'antd';
import { useTranslations } from 'next-intl';

const { Title } = Typography;

const ProfileSettingsPage = () => {
  const t = useTranslations();

  return (
    <div>
      <Title level={1} style={{ textAlign: 'center', margin: '0px 0px 20px 0px' }}>
        {t('profile.settings_title')}
      </Title>
    </div>
  );
};

export default ProfileSettingsPage;
