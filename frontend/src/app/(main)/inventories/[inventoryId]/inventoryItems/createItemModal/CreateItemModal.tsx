'use client';

import { useEffect, useState } from 'react';
import { Modal, Form, Typography, Button, Upload, message } from 'antd';
import { InputField } from '@/components/inputField/InputField';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/es/upload';
import { useTranslations } from 'next-intl';
import { TextField } from '@/components/textField/TextField';
import { InventoryUser } from '@/interfaces/inventories/InventoryUser';
import { canModifyInventory } from '@/helpers/canModifyInventory';
import type { UploadFile, UploadProps } from 'antd';
import api from '../../../../../../../axiosConfig';
import './createItemModal.css';

const { Title } = Typography;
const { Dragger } = Upload;

interface CreateItemForm {
  title: string;
  description?: string;
  image?: UploadFile[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  currentInventoryUser: InventoryUser | null;
  inventoryId: number;
}

export const CreateItemModal = ({ open, onClose, currentInventoryUser, inventoryId }: Props) => {
  const { user } = useAuth();
  const t = useTranslations();

  const [form] = Form.useForm<CreateItemForm>();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

  useEffect(() => {
    if (open) {
      form.resetFields();
      setErrorText('');
    }
  }, [open, form]);

  const handleImageChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    if (!newFileList.length) {
      setFileList([]);
      form.setFieldsValue({ image: undefined });
      return;
    }

    const lastFile = newFileList[newFileList.length - 1];
    const updated = {
      ...lastFile,
      thumbUrl: lastFile.thumbUrl || (lastFile.originFileObj ? URL.createObjectURL(lastFile.originFileObj as RcFile) : undefined),
    };

    setFileList([updated]);
    form.setFieldsValue({ image: [updated] });
  };

  const onFinishHandler = async (values: CreateItemForm) => {
    if (!user.id || !inventoryId) return;
    if (!canModifyInventory(currentInventoryUser, user)) return;
    setIsCreating(true);

    try {
      if (values.image && values.image.length > 0 && values.image[0].originFileObj) {
        const formData = new FormData();

        formData.append('title', values.title.trim());
        formData.append('inventoryId', inventoryId.toString());
        if (values.image && values.image.length > 0 && values.image[0].originFileObj) {
          formData.append('image', values.image[0].originFileObj as RcFile);
        }

        if (values.description) {
          formData.append('description', values.description.trim());
        }

        await api.post('/inventory_items', formData);
      } else {
        const body = {
          title: values.title.trim(),
          description: values.description?.trim() || null,
          inventoryId: Number(inventoryId),
        };

        await api.post('/inventory_items', body);
      }

      form.resetFields();
      onClose();
      messageApi.success({
        content: t('inventory.items.created_successfully'),
      });
    } catch {
      setErrorText('Something went wrong.. Please try again later.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} className='custom_modal' centered footer={null}>
      {contextHolder}

      <Title level={3} style={{ margin: '0px 0px 20px 0px' }}>
        {t('inventory.items.create_item_title')}
      </Title>
      {errorText ? (
        <Title level={5} style={{ margin: '0px 0px 20px 0px', color: 'var(--red-color)' }}>
          {errorText}
        </Title>
      ) : (
        <Form form={form} layout='vertical' onFinish={onFinishHandler}>
          <Form.Item
            name='image'
            rules={[{ required: false }]}
            valuePropName='fileList'
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Dragger
              accept='image/png, image/jpeg, image/jpg'
              multiple={false}
              listType='picture'
              beforeUpload={() => false}
              onChange={handleImageChange}
              fileList={fileList}
              onRemove={() => {
                setFileList([]);
                form.setFieldsValue({ image: undefined });
                return true;
              }}
            >
              <p className='ant-upload-drag-icon'>
                <UploadOutlined />
              </p>
              <p className='ant-upload-text'>{t('inventories_new.upload_image_text')}</p>
              <p className='ant-upload-hint'>{t('inventories_new.drag_drop_hint')}</p>
            </Dragger>
          </Form.Item>

          <Form.Item
            name='title'
            rules={[
              { required: true, message: '' },
              { min: 1, message: '' },
              { max: 40, message: '' },
            ]}
          >
            <InputField placeHolder={t('inventories_new.form_input_title')} maxLength={30} minLength={1} />
          </Form.Item>

          <Form.Item name='description' rules={[{ required: false }]}>
            <TextField placeHolder={t('inventories_new.form_input_description')} maxLength={255} rows={4} showCount />
          </Form.Item>

          <div className='modal_footer'>
            <Button onClick={onClose} className='create_item_form_modal_cancel_button'>
              {t('delete_modal.cancel_logout_text')}
            </Button>
            <Button htmlType='submit' className='create_item_form_modal_save_button' loading={isCreating}>
              {t('inventory.items.create_item')}
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};
