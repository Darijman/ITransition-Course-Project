'use client';

import { useAuth } from '@/contexts/authContext/AuthContext';
import { User } from '@/interfaces/User';
import { Typography, Avatar, message, Button, Upload, Form } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { UploadOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { UpdatePasswordForm } from './updatePasswordForm/UpdatePasswordForm';
import { UpdateNameForm } from './updateNameForm/UpdateNameForm';
import { Loader } from '@/ui/loader/Loader';
import type { UploadProps, RcFile, UploadFile } from 'antd/es/upload/interface';
import api from '../../../../../axiosConfig';
import './profileSettings.css';
import './responsive.css';

const { Title, Text } = Typography;

interface ProfileSettingsForm {
  name?: string;
  oldPassword?: string;
  newPassword?: string;
  avatar?: UploadFile[];
}

const ProfileSettingsPage = () => {
  const { user, setUser } = useAuth();
  const [form] = Form.useForm<ProfileSettingsForm>();
  const t = useTranslations();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [userData, setUserData] = useState<User | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  const avatarSrc = fileList[0]?.thumbUrl || preview || user?.avatarUrl || '/no-avatar.svg';

  const handleAvatarChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    if (!newFileList.length) {
      setFileList([]);
      setPreview(null);
      form.setFieldsValue({ avatar: undefined });
      return;
    }

    const updated = newFileList.map((file) => {
      if (!file.url && !file.thumbUrl && file.originFileObj) {
        const previewUrl = URL.createObjectURL(file.originFileObj as RcFile);
        return {
          ...file,
          thumbUrl: previewUrl,
        };
      }
      return file;
    });

    setFileList(updated);
    setPreview(null);
    form.setFieldsValue({ avatar: updated });
  };

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

  const onFinishHandler = async (values: ProfileSettingsForm) => {
    if (!user.id) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      if (values.name) {
        formData.append('name', values.name.trim());
      }

      if (values.oldPassword && values.newPassword) {
        formData.append('oldPassword', values.oldPassword.trim());
        formData.append('newPassword', values.newPassword.trim());
      }

      if (values.avatar && values.avatar[0]?.originFileObj) {
        formData.append('avatar', values.avatar[0].originFileObj);
      } else if (values.avatar === undefined || values.avatar.length === 0) {
        formData.append('avatarUrl', '');
      }

      const { data } = await api.put(`/users/${user.id}`, formData);
      const { id, name, role, avatarUrl } = data;
      setUser({
        id,
        name,
        role,
        avatarUrl,
        hasPassword: user.hasPassword
      });

      messageApi.success(t('profile_settings.update_success'));
      getUserData();

      form.resetFields();
    } catch (error: any) {
      const response = error.response?.data;

      if (response?.type === 'password') {
        messageApi.error(t('profile_settings.wrong_password'));
      } else {
        messageApi.error(t('profile.error_text'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {contextHolder}

      <Title level={1} style={{ textAlign: 'center', margin: 0 }}>
        {t('profile_settings.title')}
      </Title>
      <Title level={5} style={{ textAlign: 'center', color: 'var(--secondary-text-color)', margin: '0px 0px 20px 0px' }}>
        {t('profile_settings.text')}
      </Title>
      <hr style={{ border: '1px solid var(--foreground-color)' }} />

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Form form={form} layout='vertical' requiredMark={false} onFinish={onFinishHandler}>
            <div>
              <div className='profile_settings_avatar'>
                <div>
                  <Avatar
                    className={`header_avatar ${!user?.avatarUrl ? 'header_avatar_no_image' : ''}`}
                    size={100}
                    src={avatarSrc}
                    style={{ marginRight: 10, cursor: 'default' }}
                  >
                    {!avatarSrc && user?.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <Text>{t('profile_settings.profile_picture')}</Text>
                </div>

                <div className={`profile_settings_avatar_buttons ${fileList.length ? 'column' : ''}`}>
                  <Form.Item noStyle name='avatar' valuePropName='fileList' getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}>
                    <Upload
                      accept='image/png, image/jpeg, image/jpg'
                      listType='picture'
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={handleAvatarChange}
                      fileList={fileList}
                      showUploadList={{ showRemoveIcon: true }}
                    >
                      {!fileList.length && (
                        <Button type='primary' icon={<UploadOutlined style={{ fontSize: '20px' }} />}>
                          {t('profile_settings.avatar_upload_text')}
                        </Button>
                      )}
                    </Upload>
                  </Form.Item>

                  <Button
                    type='primary'
                    danger
                    icon={<DeleteOutlined style={{ fontSize: '20px' }} />}
                    onClick={() => {
                      setFileList([]);
                      setPreview(null);
                      form.setFieldsValue({ avatar: undefined });
                    }}
                  >
                    {t('profile_settings.avatar_delete_text')}
                  </Button>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <UpdateNameForm userData={userData} />
              </div>
              <UpdatePasswordForm userData={userData} />
            </div>

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
              <Button loading={isSubmitting} type='primary' size='large' htmlType='submit'>
                {t('profile_settings.save_changes')}
              </Button>
            </div>
          </Form>
        </>
      )}
    </div>
  );
};

export default ProfileSettingsPage;
