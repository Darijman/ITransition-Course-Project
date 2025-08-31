'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notifications } from '@/interfaces/notifications/Notifications.enum';
import { Notification } from '@/interfaces/notifications/Notification';
import { NotificationStatuses } from '@/interfaces/notifications/NotificationStatuses.enum';
import { useAuth } from '@/contexts/authContext/AuthContext';
import { useSocket } from '@/contexts/socketContext/SocketContext';
import api from '../../../axiosConfig';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCounts: Record<Notifications, number> & { TOTAL: number };
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider');
  return context;
};

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<Notifications, number> & { TOTAL: number }>({
    INVITE: 0,
    TOTAL: 0,
  });

  const fetchNotifications = useCallback(async () => {
    if (!user.id) return;

    try {
      const [notificationsRes, countsRes] = await Promise.all([
        api.get<Notification[]>(`/notifications/user`),
        api.get<Record<Notifications, number> & { TOTAL: number }>(`/notifications/user/count`),
      ]);

      console.log(`notificationsRes`, notificationsRes);
      console.log(`countsRes`, countsRes);

      setNotifications(notificationsRes.data);
      setUnreadCounts(countsRes.data);
    } catch (err) {
      console.error(err);
    }
  }, [user.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket || !user.email) return;

    socket.emit('join-room', user.email);

    const handler = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);

      setUnreadCounts((prev) => ({
        ...prev,
        [notification.type]: (prev[notification.type] || 0) + 1,
        TOTAL: prev.TOTAL + 1,
      }));
    };

    socket.on('notification', handler);

    return () => {
      socket.off('notification', handler);
    };
  }, [socket, user.email]);

  const markAsRead = async (notificationId: number) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, status: NotificationStatuses.READ } : n)));

      setUnreadCounts((prev) => {
        const n = notifications.find((n) => n.id === notificationId);
        if (!n || n.status === NotificationStatuses.READ) return prev;

        const newCounts = { ...prev };
        newCounts[n.type] = Math.max((newCounts[n.type] || 1) - 1, 0);
        newCounts.TOTAL = Math.max(newCounts.TOTAL - 1, 0);
        return newCounts;
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCounts,
        fetchNotifications,
        markAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
