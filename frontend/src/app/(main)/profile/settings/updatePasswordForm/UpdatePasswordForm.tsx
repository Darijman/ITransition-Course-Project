'use client';

import { Form, Button, Typography } from 'antd';
import { InputField } from '@/components/inputField/InputField';
import './updatePasswordForm.css';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { useTranslations } from 'next-intl';
import { User } from '@/interfaces/User';
import { formatDate } from '@/helpers/formatDate';

const { Title } = Typography;

interface UpdatePasswordForm {
  oldPassword: string;
  newPassword: string;
}

interface Props {
  userData: User | null;
}

export const UpdatePasswordForm = ({ userData }: Props) => {
  const { user } = useAuth();
  const t = useTranslations();

  const [form] = Form.useForm<UpdatePasswordForm>();
  const passwordDate = userData?.passwordUpdatedAt ? formatDate(userData.passwordUpdatedAt) : '';
  const passwordLastModified = t('profile_settings.password_last_modified') + ' ' + passwordDate;

  console.log(`userData`, userData);

  return (
    <div className='update_password_form'>
      <Title level={4} style={{ textAlign: 'center', margin: 0 }}>
        {t('profile_settings.password_title')}
      </Title>
      <Title level={5} style={{ textAlign: 'center', color: 'var(--secondary-text-color)', margin: '0px 0px 20px 0px' }}>
        {t('profile_settings.password_text')}
      </Title>
      <Form form={form} layout='vertical' requiredMark={false}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item
            label={t('profile_settings.old_password')}
            name='oldPassword'
            style={{ flex: 1 }}
            rules={[{ required: true, message: '' }]}
          >
            <InputField type='password' minLength={6} maxLength={100} placeHolder={t('profile_settings.old_password')} />
          </Form.Item>

          <Form.Item
            label={t('profile_settings.new_passsword')}
            name='newPassword'
            style={{ flex: 1 }}
            rules={[{ required: true, message: '' }]}
          >
            <InputField type='password' minLength={6} maxLength={100} placeHolder={passwordLastModified} />
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};
