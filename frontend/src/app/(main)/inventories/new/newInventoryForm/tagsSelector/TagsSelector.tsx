'use client';

import { Flex, Tag, Typography } from 'antd';
import { InventoryTag } from '@/interfaces/inventories/InventoryTag';
import { useTranslations } from 'next-intl';

const { Title } = Typography;

interface TagSelectorProps {
  value?: number[];
  onChange?: (val: number[]) => void;
  tags: InventoryTag[];
  hasError: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ value = [], onChange, tags, hasError }) => {
  const t = useTranslations();

  const handleToggle = (tagId: number, checked: boolean) => {
    let next: number[] = [];

    if (checked) {
      if (value.length >= 5) {
        return;
      }
      next = [...value, tagId];
    } else {
      next = value.filter((id) => id !== tagId);
    }

    onChange?.(next);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--background-color)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        border: hasError ? '1px solid var(--red-color)' : 'none',
      }}
    >
      <Flex gap={12} wrap align='center'>
        <Title
          level={5}
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--secondary-text-color)',
          }}
        >
          {t('inventories_new.tags_title')} (5)
        </Title>

        {tags.map((tag) => {
          const isSelected = value.includes(tag.id);
          return (
            <Tag.CheckableTag
              key={tag.id}
              checked={isSelected}
              onChange={(checked) => handleToggle(tag.id, checked)}
              style={{
                padding: '6px 14px',
                borderRadius: '18px',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                userSelect: 'none',
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--submit-button-color)' : '1px solid #e0e0e0',
                background: isSelected ? 'var(--submit-button-color)' : 'var(--foreground-color)',
              }}
            >
              {tag.title}
            </Tag.CheckableTag>
          );
        })}
      </Flex>
    </div>
  );
};
