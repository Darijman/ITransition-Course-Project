'use client';

import { InputField } from '@/components/inputField/InputField';
import { User } from '@/interfaces/User';
import { Typography, Form } from 'antd';
import { useTranslations } from 'next-intl';
import './updateNameForm.css';

const { Title } = Typography;

interface Props {
  userData: User | null;
}

export const UpdateNameForm = ({ userData }: Props) => {
  const t = useTranslations();

  return (
    <div className='update_name_form'>
      <Title level={4} style={{ textAlign: 'center', margin: 0 }}>
        {t('profile_settings.name_title')}
      </Title>
      <Title level={5} style={{ textAlign: 'center', color: 'var(--secondary-text-color)', margin: '0px 0px 20px 0px' }}>
        {t('profile_settings.name_text')}
      </Title>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Form.Item
          name='name'
          label={t('profile_settings.name_title')}
          style={{ flex: 1 }}
          rules={[{ required: false }]}
        >
          <InputField placeHolder={userData?.name} />
        </Form.Item>
      </div>
    </div>
  );
};
