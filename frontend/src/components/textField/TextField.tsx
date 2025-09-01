'use client';

import React, { ReactNode, KeyboardEventHandler } from 'react';
import { Input, ConfigProvider } from 'antd';
import './textField.css';

const { TextArea } = Input;

interface Props {
  value?: string;
  defaultValue?: string;
  showCount?: boolean | { formatter: (info: { value: string; count: number; maxLength?: number }) => ReactNode };
  allowClear?: boolean;
  placeHolder?: string;
  style?: React.CSSProperties;
  name?: string;
  className?: string;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  autoFocus?: boolean;
  onChange?: React.ChangeEventHandler;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
}

export const TextField = ({
  value,
  defaultValue,
  showCount,
  allowClear,
  placeHolder,
  style,
  name,
  className,
  maxLength,
  minLength,
  rows,
  autoFocus,
  onChange,
  onKeyDown,
}: Props) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            colorBgContainer: 'var(--background-color)',
            colorBorder: 'var(--background-color)',
            colorText: 'var(--primary-text-color)',
            colorTextDescription: 'var(--secondary-text-color)', //counter
            activeBorderColor: 'var(--primary-text-color)',
            activeShadow: 'none',
            hoverBorderColor: 'none',

            colorTextPlaceholder: 'var(--secondary-text-color)',
            colorError: 'var(--red-color)',
            colorSuccess: 'var(--green-color)',
            colorErrorBorder: 'var(--red-color)',
            colorErrorBorderHover: 'var(--red-color)',
            colorSuccessBorder: 'var(--green-color)',
            colorSuccessBorderHover: 'var(--green-color)',

            fontSize: 16,
            paddingInline: 20,
            paddingInlineLG: 20,
            paddingInlineSM: 20,
            paddingBlockLG: 10,
            paddingBlockSM: 10,
            paddingBlock: 10,
            borderRadiusLG: 10,
            borderRadiusSM: 10,
            borderRadiusXS: 10,

            lineHeight: 1.5,
          },
        },
      }}
    >
      <TextArea
        value={value}
        defaultValue={defaultValue}
        showCount={showCount}
        allowClear={allowClear}
        placeholder={placeHolder}
        style={{ ...style, resize: 'none' }}
        name={name}
        className={`${className} text_area`}
        maxLength={maxLength}
        minLength={minLength}
        onChange={onChange}
        onKeyDown={onKeyDown}
        autoSize={false}
        rows={rows}
        autoFocus={autoFocus}
      />
    </ConfigProvider>
  );
};
