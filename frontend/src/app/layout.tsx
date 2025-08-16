import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { ConfigProvider } from 'antd';
import { theme } from '@/antdConfig';
import { LocaleProvider } from '@/contexts/localeContext/LocaleContext';

import '@ant-design/v5-patch-for-react-19';
import './globals.css';

export const metadata: Metadata = {
  title: 'ITransition-Course-Project',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <ConfigProvider theme={theme}>
          <ThemeProvider attribute='data-theme' defaultTheme='system' enableSystem>
            <LocaleProvider>{children}</LocaleProvider>
          </ThemeProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
