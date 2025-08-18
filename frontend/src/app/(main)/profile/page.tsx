'use client';

import { useAuth } from '@/contexts/authContext/AuthContext';
import { User } from '@/interfaces/User';
import { Image, message, Typography, Descriptions, Button } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { CiSettings } from 'react-icons/ci';
import { MdDelete } from 'react-icons/md';
import { Loader } from '@/ui/loader/Loader';
import api from '../../../../axiosConfig';
import './profile.css';
import { useRouter } from 'next/navigation';

const { Title } = Typography;
const { Item } = Descriptions;

const Profile = () => {
  const { user } = useAuth();
  const t = useTranslations();
  const router = useRouter();

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
          <div className='profile_info_avatar'>
            <Image
              style={{ borderRadius: '16px', objectFit: 'cover' }}
              src={user?.avatarUrl || '/no-avatar.svg'}
              alt={user?.name}
              width={200}
              height={200}
            />
          </div>

          <div className='profile_info_data'>
            <Descriptions
              className='profile_info_data_description'
              title={<div style={{ textAlign: 'center', marginTop: 10 }}>{t('profile.user_info')}</div>}
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

          <div className='profile_info_actions'>
            <Title level={5} style={{ textAlign: 'center', margin: '0px 0px 15px 0px' }}>
              {t('profile.profile_management')}
            </Title>
            <Button
              style={{
                maxWidth: '200px',
                width: '100%',
                marginBottom: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 8,
              }}
              type='primary'
              danger
              iconPosition='start'
              icon={<MdDelete style={{ fontSize: '20px' }} />}
            >
              {t('profile.delete_account_text')}
            </Button>
            <Button
              style={{ maxWidth: '200px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}
              type='primary'
              iconPosition='start'
              icon={<CiSettings style={{ fontSize: '20px' }} />}
              onClick={() => router.push('/profile/settings')}
            >
              {t('profile.settings')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
