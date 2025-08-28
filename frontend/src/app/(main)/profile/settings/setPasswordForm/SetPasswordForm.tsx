'use client';

import { InputField } from '@/components/inputField/InputField';
import { Typography, Form } from 'antd';
import { useTranslations } from 'next-intl';
import './setPasswordForm.css';

const { Title } = Typography;

export const SetPasswordForm = () => {
  const t = useTranslations();

  return (
    <div className='set_password_form'>
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
        {t('profile_settings.set_password')}
      </Title>

      <Form.Item
        style={{ flex: 1 }}
        label={t('profile_settings.new_password')}
        name='password'
        rules={[
          ({}) => ({
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
              return Promise.resolve();
            },
          }),
        ]}
      >
        <InputField type='password' minLength={6} maxLength={100} placeHolder='Password' />
      </Form.Item>
    </div>
  );
};
