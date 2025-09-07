'use client';

import { useCallback, useEffect, useState } from 'react';
import { Form, UploadFile, Upload, Button, Image, Space, Tooltip, UploadProps, message, Spin } from 'antd';
import { InputField } from '@/components/inputField/InputField';
import { InventoryStatuses } from '@/interfaces/inventories/Inventory';
import { UploadOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { useTranslations } from 'next-intl';
import { TextField } from '@/components/textField/TextField';
import { InventoryTag } from '@/interfaces/inventories/InventoryTag';
import { InventoryCategory } from '@/interfaces/inventories/InventoryCategory';
import { Select } from '@/components/select/Select';
import { TagSelector } from './tagsSelector/TagsSelector';
import { RcFile } from 'antd/es/upload';
import { useRouter } from 'next/navigation';
import api from '../../../../../../axiosConfig';
import './newInventoryForm.css';
import './responsive.css';

const { Dragger } = Upload;

interface NewInventoryForm {
  title: string;
  description?: string;
  tagIds: number[];
  categoryId: number;
  image: UploadFile[];
  status: InventoryStatuses;
}

export const NewInventoryForm = () => {
  const { user } = useAuth();
  const t = useTranslations();
  const router = useRouter();

  const [form] = Form.useForm<NewInventoryForm>();

  const [tags, setTags] = useState<InventoryTag[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [imageError, setImageError] = useState<boolean>(false);
  const [tagsError, setTagsError] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage({ maxCount: 2, duration: 5 });

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
    setImageError(false);
  };

  const getCategoriesAndTags = useCallback(async () => {
    if (!user.id) return;

    try {
      const [inventoryCategories, inventoryTags] = await Promise.all([
        api.get<InventoryCategory[]>(`/inventory_categories`),
        api.get<InventoryTag[]>(`/inventory_tags`),
      ]);

      setCategories(inventoryCategories.data);
      setTags(inventoryTags.data);
    } catch {}
  }, [user.id]);

  useEffect(() => {
    getCategoriesAndTags();
  }, [getCategoriesAndTags]);

  const onFinishFailedHandler = async () => {
    const image = form.getFieldValue('image');
    const tags = form.getFieldValue('tagIds');

    if (!image || image.length === 0) {
      setImageError(true);
    }
    if (!tags || tags.length === 0) {
      setTagsError(true);
    }
  };

  const onFinishHandler = async (values: NewInventoryForm) => {
    if (!user.id) return;
    setIsCreating(true);

    const formData = new FormData();
    formData.append('title', values.title.trim());
    formData.append('status', values.status.trim());
    formData.append('categoryId', values.categoryId.toString().trim());
    formData.append('tagIds', JSON.stringify(values.tagIds.map(Number)));
    if (values.description) {
      formData.append('description', values.description.trim());
    }

    if (values.image && values.image.length > 0 && values.image[0].originFileObj) {
      formData.append('image', values.image[0].originFileObj as RcFile);
    } else {
      setImageError(true);
      setIsCreating(false);
      return;
    }

    try {
      const { data: inventory } = await api.post('/inventories', formData);
      form.resetFields();
      setFileList([]);

      messageApi.success({
        content: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {t('inventories_new.created_successfully')}
            <Spin size='default' />
          </div>
        ),
        onClose: () => router.push(`/inventories/${inventory.id}`),
        duration: 2,
        key: 'creatingInventory',
      });
    } catch {
      messageApi.error({
        content: t('inventories_new.creating_error'),
        duration: 3,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='inventory_form_wrapper'>
      {contextHolder}

      <div className='new_inventory_form'>
        <Form
          form={form}
          style={{ width: '100%' }}
          onFinish={onFinishHandler}
          onFinishFailed={onFinishFailedHandler}
          onValuesChange={(changedValues) => {
            if ('tagIds' in changedValues) {
              const tags = changedValues.tagIds || [];
              setTagsError(tags.length === 0);
            }
          }}
          initialValues={{
            status: InventoryStatuses.PRIVATE,
          }}
        >
          <Form.Item
            name='image'
            rules={[{ required: true, message: '' }]}
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
              style={{ border: imageError ? '1px dashed var(--red-color)' : '1px dashed var(--primary-text-color)' }}
              onRemove={() => {
                setImageError(true);
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

          {fileList.length > 0 && (
            <div className='inventory_form_image_container'>
              <Image
                style={{ borderRadius: '10px', objectFit: 'cover' }}
                src={fileList[0].thumbUrl || fileList[0].url}
                alt={fileList[0].name || 'image'}
                className='inventory_form_image'
              />
            </div>
          )}

          <Form.Item name='title' rules={[{ required: true, message: '' }]}>
            <InputField placeHolder={t('inventories_new.form_input_title')} />
          </Form.Item>

          <Form.Item name='tagIds' rules={[{ required: true, message: '' }]}>
            <TagSelector tags={tags} hasError={tagsError} />
          </Form.Item>

          <Form.Item name='description' rules={[{ required: false }]}>
            <TextField placeHolder={t('inventories_new.form_input_description')} maxLength={255} rows={4} />
          </Form.Item>

          <Form.Item name='categoryId' rules={[{ required: true, message: '' }]}>
            <Select
              style={{ width: '100%', height: '45px' }}
              placeholder={t('inventories_new.select_category_placeholder')}
              options={categories.map((category) => ({
                label: category.title,
                value: category.id,
              }))}
            />
          </Form.Item>

          <Form.Item name='status' rules={[{ required: true, message: '' }]}>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue, setFieldsValue }) => {
                const current = getFieldValue('status');
                return (
                  <Space.Compact>
                    <Tooltip title={t('inventories_new.status_tooltip_private')}>
                      <Button
                        type={current === InventoryStatuses.PRIVATE ? 'primary' : 'default'}
                        style={{ maxWidth: '250px', width: '100%', color: current === InventoryStatuses.PRIVATE ? '#FFFFFF' : 'black' }}
                        onClick={() => setFieldsValue({ status: InventoryStatuses.PRIVATE })}
                      >
                        {t('inventories_new.private')}
                      </Button>
                    </Tooltip>
                    <Tooltip title={t('inventories_new.status_tooltip_public')}>
                      <Button
                        type={current === InventoryStatuses.PUBLIC ? 'primary' : 'default'}
                        style={{ maxWidth: '250px', width: '100%', color: current === InventoryStatuses.PUBLIC ? '#FFFFFF' : 'black' }}
                        onClick={() => setFieldsValue({ status: InventoryStatuses.PUBLIC })}
                      >
                        {t('inventories_new.public')}
                      </Button>
                    </Tooltip>
                  </Space.Compact>
                );
              }}
            </Form.Item>
          </Form.Item>

          <Form.Item>
            <Button loading={isCreating} htmlType='submit' type='primary' style={{ width: '100%', height: '40px' }}>
              {t('inventories_new.create_inventory')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
