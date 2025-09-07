'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/authContext/AuthContext';
import { Header } from '@/ui/header/Header';
import { SocketProvider } from '@/contexts/socketContext/SocketContext';
import { NotificationsProvider } from '@/contexts/notificationContext/NotificationContext';
import './layout.css';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationsProvider>
          <Header />
          <main className='main'>{children}</main>
        </NotificationsProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
