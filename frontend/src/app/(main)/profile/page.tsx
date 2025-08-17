'use client';

import { useAuth } from '@/contexts/authContext/AuthContext';
import { User } from '@/interfaces/User';
import { Image, message, Typography, Descriptions } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Loader } from '@/ui/loader/Loader';
import api from '../../../../axiosConfig';
import './profile.css';

const { Title } = Typography;
const { Item } = Descriptions;

const Profile = () => {
  const { user } = useAuth();
  const t = useTranslations();

  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  const getUserData = useCallback(async () => {
    if (!user.id) return;
    setIsLoading(true);

    try {
      const { data } = await api.get(`/users/${user.id}`);
      setUserData(data);
    } catch {
      messageApi.open({ type: 'error', content: t('profile.error_text') });
    } finally {
      setIsLoading(false);
    }
  }, [user.id, t, messageApi]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  console.log(`userData`, userData);

  return (
    <div>
      {contextHolder}

      <Title level={1} style={{ textAlign: 'center', margin: '0px 0px 20px 0px' }}>
        {t('header.profile')}
      </Title>

      {isLoading ? (
        <Loader />
      ) : (
        <div className='profile_info'>
          <div className='profile_info_data'>
            <Descriptions
              className='profile_info_data_description'
              title={<div style={{ textAlign: 'center', width: '100%' }}>{t('profile.user_info')}</div>}
              column={1}
              size='small'
              bordered
            >
              <Item label={t('profile.user_info_name')}>{userData?.name}</Item>
              <Item label={t('profile.user_info_email')}>{userData?.email}</Item>
              <Item label={t('profile.user_info_provider')}>{userData?.provider || t('profile.user_info_provider_default')}</Item>
              <Item label={t('profile.user_info_joined_date')}>{new Date(userData?.createdAt || '').toLocaleDateString()}</Item>
            </Descriptions>
          </div>
          <div className='profie_info_avatar'>
            <Image
              style={{ borderRadius: '16px', objectFit: 'cover' }}
              src={user?.avatarUrl || '/no-avatar.svg'}
              alt={user?.name}
              width={200}
              height={200}
            />
          </div>
          <div></div>
        </div>
      )}
    </div>
  );
};

export default Profile;
