'use client';

import { useState } from 'react';
import { TextField } from '@/components/textField/TextField';
import { Button, Form, message } from 'antd';
import { useTranslations } from 'next-intl';
import { canModifyInventory } from '@/helpers/canModifyInventory';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { Inventory } from '@/interfaces/inventories/Inventory';
import api from '../../../../../../../axiosConfig';
import './addInventoryCommentForm.css';

interface InventoryCommentForm {
  text: string;
}

interface Props {
  currentInventoryUser: InventoryUser | null;
  inventory: Inventory | null;
}

export const AddInventoryCommentForm = ({ currentInventoryUser, inventory }: Props) => {
  const { user } = useAuth();
  const [form] = Form.useForm();

  const t = useTranslations();
  const textValue = Form.useWatch('text', form);

  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });
  const [isPostingComment, setIsPostingComment] = useState<boolean>(false);

  const onFinishHandler = async (values: InventoryCommentForm) => {
    if (!canModifyInventory(currentInventoryUser, user) || !inventory) return;
    setIsPostingComment(true);

    const newComment = {
      inventoryId: inventory.id,
      text: values.text.trim(),
    };

    try {
      await api.post(`/inventory_comments`, newComment);
      form.resetFields();
    } catch {
      messageApi.error({
        content: t('inventory.discussion.failed_to_post_comment'),
      });
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <div className='add_inventory_comment_form'>
      {contextHolder}

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
          <Button
            htmlType='submit'
            loading={isPostingComment}
            className='inventory_comment_form_post_button'
            disabled={!textValue?.trim()}
            type='primary'
          >
            {t('inventory.discussion.post_button')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
