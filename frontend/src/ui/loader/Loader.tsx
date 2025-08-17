'use client';

import { Spin } from 'antd';

export function Loader() {
  return (
    <Spin
      size='large'
      style={{
        display: 'block',
        margin: '40px auto',
      }}
    />
  );
}
