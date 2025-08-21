'use client';

import { useState } from 'react';
import { Typography, Form, UploadFile, Upload, Button, Image } from 'antd';
import { InputField } from '@/components/inputField/InputField';
import { InventoryStatuses } from '@/interfaces/Inventory';
import { UploadOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { useTranslations } from 'next-intl';
import './newInventoryForm.css';
import { TextField } from '@/components/textField/TextField';

const { Dragger } = Upload;

interface NewInventoryForm {
  title: string;
  description?: string;
  tagIds: number[];
  categoryId: number;
  image: UploadFile;
  status: InventoryStatuses;
}

export const NewInventoryForm = () => {
  const { user } = useAuth();
  const t = useTranslations();

  const [form] = Form.useForm<NewInventoryForm>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleFileChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
    form.setFieldsValue({ image: newFileList[0] });
  };

  return (
    <div className='inventory_form_wrapper'>
      <div className='new_inventory_form'>
        <Form form={form} style={{ width: '100%' }}>
          <Form.Item noStyle name='image' valuePropName='fileList' getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}>
            <Dragger
              accept='image/png, image/jpeg, image/jpg'
              multiple={false}
              beforeUpload={() => false}
              fileList={fileList}
              onChange={handleFileChange}
              showUploadList={{ showRemoveIcon: true }}
              className='custom_dragger'
            >
              <p className='ant-upload-drag-icon'>
                <UploadOutlined />
              </p>
              <p className='ant-upload-text'>{t('inventories_new.upload_image_text')}</p>
              <p className='ant-upload-hint'>{t('inventories_new.drag_drop_hint')}</p>
            </Dragger>
          </Form.Item>

          <div>
            <Image />
          </div>

          <Form.Item name='title' rules={[{ required: true, message: '' }]}>
            <InputField placeHolder={t('inventories_new.form_input_title')} />
          </Form.Item>

          <Form.Item name='description' rules={[{ required: false }]}>
            <TextField placeHolder={t('inventories_new.form_input_description')} maxLength={255} rows={4} />
          </Form.Item>

          
        </Form>
      </div>
    </div>
  );
};
