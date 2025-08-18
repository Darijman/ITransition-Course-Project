'use client';

import { useState } from 'react';
import { Modal as AntdModal, Button, Typography, Popconfirm } from 'antd';
import './deleteModal.css';
import './responsive.css';

import AttentionIcon from '@/assets/svg/attention.svg';
import { useLocale } from '@/contexts/localeContext/LocaleContext';

const { Title, Paragraph } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  onCancel?: () => void;
  isDeleting?: boolean;
  deleteButtonText?: string;
  cancelButtonText?: string;
  title: string;
  text: string;
  errorMessage?: string;
  doubleConfirm?: boolean;
}

export const DeleteModal = ({
  open,
  onClose,
  onDelete,
  onCancel,
  isDeleting,
  deleteButtonText,
  cancelButtonText,
  title,
  text,
  errorMessage,
  doubleConfirm = false,
}: Props) => {
  const { locale } = useLocale();
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const handleCancel = () => {
    setIsConfirming(false);
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <AntdModal open={open} onCancel={handleCancel} className='custom_modal' centered footer={null}>
      <AttentionIcon className='modal_attention_icon' />

      {errorMessage ? (
        <Title level={4} style={{ margin: 0, color: 'red' }}>
          {errorMessage}
        </Title>
      ) : (
        <>
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>

          <Paragraph style={{ fontSize: '16px', color: 'var(--secondary-text-color)' }}>{text}</Paragraph>

          <div className='modal_footer'>
            <Button className='delete_modal_cancel_button' style={{ marginRight: '10px' }} onClick={handleCancel}>
              {cancelButtonText ?? 'Cancel'}
            </Button>
            <Button
              className='delete_modal_delete_button'
              type='primary'
              danger
              loading={isDeleting}
              onClick={() => {
                if (doubleConfirm) {
                  setIsConfirming(true);
                } else {
                  onDelete();
                }
              }}
            >
              {deleteButtonText ?? 'Yes, delete it'}
            </Button>

            {doubleConfirm && (
              <Popconfirm
                title={
                  locale === 'en'
                    ? 'This action is irreversible. Are you sure you want to delete?'
                    : 'Это действие необратимо. Вы уверены, что хотите удалить?'
                }
                onConfirm={onDelete}
                open={isConfirming}
                onOpenChange={(visible) => setIsConfirming(visible)}
                okText={locale === 'en' ? 'Yes, delete!' : 'Да, удалить!'}
                cancelText={locale === 'en' ? 'Cancel' : 'Отмена'}
                placement='topRight'
                getPopupContainer={(trigger) => trigger.parentElement || document.body}
                okButtonProps={{ danger: true, style: { backgroundColor: 'red', borderColor: 'red' } }}
                cancelButtonProps={{ style: { backgroundColor: 'var(--secondary-text-color)', color: '#FFFFFF' } }}
              >
                <span />
              </Popconfirm>
            )}
          </div>
        </>
      )}
    </AntdModal>
  );
};
