'use client';

import { Modal as AntdModal, Button, Typography } from 'antd';
import './deleteModal.css';
import './responsive.css';

import AttentionIcon from '@/assets/svg/attention.svg';

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
}

export const DeleteModal = ({ open, onClose, onDelete, onCancel, isDeleting, deleteButtonText, cancelButtonText, title, text, errorMessage }: Props) => {
  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <AntdModal open={open} onOk={onDelete} onCancel={handleCancel} className='custom_modal' centered footer={null}>
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
            <Button className='delete_modal_delete_button' type='primary' danger onClick={onDelete} loading={isDeleting}>
              {deleteButtonText ?? 'Yes, delete it'}
            </Button>
          </div>
        </>
      )}
    </AntdModal>
  );
};
