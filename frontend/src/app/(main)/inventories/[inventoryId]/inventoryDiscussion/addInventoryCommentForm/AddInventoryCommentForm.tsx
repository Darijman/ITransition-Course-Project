'use client';

import { TextField } from '@/components/textField/TextField';
import './addInventoryCommentForm.css';
import { Button, Form } from 'antd';
import { useTranslations } from 'next-intl';

interface InventoryCommentForm {
  text: string;
}

export const AddInventoryCommentForm = () => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const textValue = Form.useWatch('text', form);

  const onFinishHandler = async (values: InventoryCommentForm) => {
    console.log(`values`, values);
  };

  return (
    <div className='add_inventory_comment_form'>
      <Form form={form} onFinish={onFinishHandler} layout='inline' style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
        <Form.Item
          name='text'
          rules={[
            { required: true, message: '' },
            { max: 255, min: 1 },
          ]}
          style={{ flex: 1 }}
          validateStatus=''
        >
          <TextField placeHolder={t('inventory.discussion.add_comment_textfield_placeholder')} showCount maxLength={255} minLength={1} />
        </Form.Item>

        <Form.Item>
          <Button className='inventory_comment_form_post_button' disabled={!textValue?.trim()} type='primary'>
            {t('inventory.discussion.post_button')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
