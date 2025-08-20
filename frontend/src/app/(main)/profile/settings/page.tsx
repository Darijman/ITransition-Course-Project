'use client';

import { useAuth } from '@/contexts/authContext/AuthContext';
import { User } from '@/interfaces/User';
import { Typography, Avatar, message, Button, Upload, Form } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { UploadOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import api from '../../../../../axiosConfig';
import './profileSettings.css';
import { useRouter } from 'next/navigation';
import { UpdatePasswordForm } from './updatePasswordForm/UpdatePasswordForm';
import { UpdateNameForm } from './updateNameForm/UpdateNameForm';

const { Title, Text } = Typography;

const ProfileSettingsPage = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();

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

      <div className='profile_settings_top'>
        <Button
          style={{ backgroundColor: 'var(--secondary-text-color)' }}
          className='profile_settings_back_button'
          type='primary'
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/profile')}
        >
          {t('profile_settings.back_to_profile')}
        </Button>
        <Title level={1} style={{ textAlign: 'center', margin: 0 }}>
          {t('profile_settings.title')}
        </Title>
      </div>
      <Title level={5} style={{ textAlign: 'center', color: 'var(--secondary-text-color)', margin: '0px 0px 20px 0px' }}>
        {t('profile_settings.text')}
      </Title>
      <hr style={{ border: '1px solid var(--foreground-color)' }} />

      <Form form={form} layout='vertical' requiredMark={false}>
        <div>
          <div className='profile_settings_avatar'>
            <div>
              <Avatar
                className={`header_avatar ${!user?.avatarUrl ? 'header_avatar_no_image' : ''}`}
                size={100}
                src={user?.avatarUrl || '/no-avatar.svg'}
                style={{ marginRight: 10, cursor: 'default' }}
              >
                {!user?.avatarUrl && user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Text>{t('profile_settings.profile_picture')}</Text>
            </div>
            <div className='profile_settings_avatar_buttons'>
              <Upload>
                <Button type='primary' icon={<UploadOutlined style={{ fontSize: '20px' }} />}>
                  {t('profile_settings.avatar_upload_text')}
                </Button>
              </Upload>
              <Button type='primary' danger icon={<DeleteOutlined style={{ fontSize: '20px' }} />}>
                {t('profile_settings.avatar_delete_text')}
              </Button>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <UpdateNameForm userData={userData} />
          </div>
          <UpdatePasswordForm userData={userData} />
        </div>
      </Form>

      <div className='profile_settings_footer'>
        <Button
          style={{ backgroundColor: 'var(--secondary-text-color)' }}
          size='large'
          type='primary'
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/profile')}
        >
          {t('profile_settings.back_to_profile')}
        </Button>
        <Button type='primary' size='large'>
          {t('profile_settings.save_changes')}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
