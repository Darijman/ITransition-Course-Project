'use client';

import { Form, Typography } from 'antd';
import { InputField } from '@/components/inputField/InputField';
import { useTranslations } from 'next-intl';
import { User } from '@/interfaces/users/User';
import { formatDate } from '@/helpers/formatDate';
import './updatePasswordForm.css';

const { Title } = Typography;

interface Props {
  userData: User | null;
}

export const UpdatePasswordForm = ({ userData }: Props) => {
  const t = useTranslations();

  const passwordDate = userData?.passwordUpdatedAt ? formatDate(userData.passwordUpdatedAt) : '';
  const passwordLastModified = `${t('profile_settings.password_last_modified')} ${passwordDate}`;

  return (
    <div className='update_password_form'>
      <Title level={4} style={{ textAlign: 'center', margin: 0 }}>
        {t('profile_settings.password_title')}
      </Title>
      <Title
        level={5}
        style={{
          textAlign: 'center',
          color: 'var(--secondary-text-color)',
          margin: '0px 0px 20px 0px',
        }}
      >
        {t('profile_settings.password_text')}
      </Title>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Form.Item
          label={t('profile_settings.old_password')}
          name='oldPassword'
          dependencies={['newPassword']}
          style={{ flex: 1 }}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                const newPassword = getFieldValue('newPassword');
                if (!newPassword && !value) {
                  return Promise.resolve();
                }
                if (!value) {
                  return Promise.reject();
                }
                if (value.length < 6) {
                  return Promise.reject(new Error(t('profile_settings.password_min')));
                }

                if (value.length > 100) {
                  return Promise.reject(new Error(t('profile_settings.password_max')));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <InputField type='password' minLength={6} maxLength={100} placeHolder={t('profile_settings.old_password')} />
        </Form.Item>

        <Form.Item
          label={t('profile_settings.new_password')}
          name='newPassword'
          dependencies={['oldPassword']}
          style={{ flex: 1 }}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) {
                  return Promise.resolve();
                }
                if (value.length < 6) {
                  return Promise.reject(new Error(t('profile_settings.password_min')));
                }
                if (value.length > 100) {
                  return Promise.reject(new Error(t('profile_settings.password_max')));
                }
                if (value === getFieldValue('oldPassword')) {
                  return Promise.reject(new Error(t('profile_settings.password_same')));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <InputField type='password' minLength={6} maxLength={100} placeHolder={passwordLastModified} />
        </Form.Item>
      </div>
    </div>
  );
};
