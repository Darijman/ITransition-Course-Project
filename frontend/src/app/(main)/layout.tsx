'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/contexts/authContext/AuthContext';
import { useRouter } from 'next/navigation';
import { Header } from '@/ui/header/Header';
// import { emitter } from '@/events';
import api from '../../../axiosConfig';
import './layout.css';
import { SocketProvider } from '@/contexts/socketContext/SocketContext';
import { NotificationsProvider } from '@/contexts/notificationContext/NotificationContext';
// import { SocketProvider } from '@/contexts/socketContext/SocketContext';

export default function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // useEffect(() => {
  //   emitter.on('logout', async () => {
  //     await api.post(`/auth/logout`);
  //     router.push(`/auth/login`);
  //   });
  //   return () => {
  //     emitter.off('logout');
  //   };
  // }, [router]);

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
