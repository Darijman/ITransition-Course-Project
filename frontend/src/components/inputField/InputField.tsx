'use client';

import React, { ReactNode, forwardRef } from 'react';
import { ConfigProvider, Input } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';

interface Props {
  variant?: 'outlined' | 'filled' | 'borderless' | 'underlined';
  size?: 'large' | 'middle' | 'small';
  value?: string;
  defaultValue?: string;
  placeHolder?: string;
  type?: 'search' | 'password';
  style?: React.CSSProperties;
  allowClear?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  status?: 'error' | 'warning' | '';
  loading?: boolean;
  visible?: boolean;
  name?: string;
  className?: string;
  inputMode?: 'search' | 'text' | 'url' | 'email' | 'numeric' | 'none' | 'tel' | 'decimal';
  addonAfter?: string;
  suffix?: string;
  autoFocus?: boolean;
  iconRender?: (visible: boolean) => ReactNode;
  onVisibleChange?: (visible: boolean) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
  onSearch?: (
    value: string,
    event?: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLInputElement>,
    info?: { source?: 'input' | 'clear' },
  ) => void;
  onClear?: () => void;
}

export const InputField = forwardRef<InputRef, Props>(({
  variant,
  size,
  value,
  defaultValue,
  placeHolder,
  type,
  style,
  allowClear,
  disabled,
  maxLength,
  minLength,
  status,
  loading,
  visible,
  name,
  className,
  inputMode,
  addonAfter,
  suffix,
  autoFocus,
  iconRender = (visible): ReactNode =>
    visible ? (
      <EyeOutlined style={{ color: 'var(--primary-text-color)' }} />
    ) : (
      <EyeInvisibleOutlined style={{ color: 'var(--primary-text-color)' }} />
    ),
  onVisibleChange,
  onChange,
  onKeyDown,
  onPaste,
  onSearch,
  onClear,
}, ref) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            colorBgContainer: 'var(--background-color)',
            colorBorder: 'var(--background-color)',
            colorText: 'var(--primary-text-color)',
            activeBorderColor: 'var(--primary-text-color)',
            activeShadow: 'none',
            hoverBorderColor: 'var(--secondary-text-color)',

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
          },
        },
      }}
    >
      {type === 'password' ? (
        <Input.Password
          variant={variant}
          size={size}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeHolder}
          style={style}
          allowClear={allowClear}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          status={status}
          name={name}
          className={className}
          inputMode={inputMode}
          addonAfter={addonAfter}
          suffix={suffix}
          iconRender={iconRender}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          visibilityToggle={{ visible, onVisibleChange }}
          onClear={onClear}
          autoFocus={autoFocus}
        />
      ) : type === 'search' ? (
        <Input.Search
          variant={variant}
          size={size}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeHolder}
          style={style}
          allowClear={allowClear}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          status={status}
          name={name}
          className={className}
          inputMode={inputMode}
          addonAfter={addonAfter}
          suffix={suffix}
          loading={loading}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onSearch={onSearch}
          onClear={onClear}
          autoFocus={autoFocus}
        />
      ) : (
        <Input
          variant={variant}
          size={size}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeHolder}
          style={style}
          allowClear={allowClear}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          status={status}
          name={name}
          className={className}
          inputMode={inputMode}
          addonAfter={addonAfter}
          suffix={suffix}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onClear={onClear}
          autoFocus={autoFocus}
        />
      )}
    </ConfigProvider>
  );
});

InputField.displayName = 'InputField';
