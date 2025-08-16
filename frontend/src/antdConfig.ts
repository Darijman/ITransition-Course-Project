import { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  components: {
    Card: {
      headerFontSize: 20,
    },
    Message: {
      contentBg: 'var(--foreground-color)',
    },
    Popover: {
      colorBgElevated: 'var(--foreground-color)',
    },
  },
  token: {
    fontFamily: 'Signika Negative, sans-serif',
    colorText: 'var(--primary-text-color)',
    colorTextHeading: 'var(--primary-text-color)', // h1,h2,h3,h4,h5
    colorTextDescription: 'var(--secondary-text-color)', // meta.description
  },
};
