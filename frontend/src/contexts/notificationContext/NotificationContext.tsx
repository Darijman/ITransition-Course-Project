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
  getNotifications: () => Promise<void>;
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

  const getNotifications = useCallback(async () => {
    if (!user.id) return;

    try {
      const [notificationsRes, countsRes] = await Promise.all([
        api.get<Notification[]>(`/notifications/user`),
        api.get<Record<Notifications, number> & { TOTAL: number }>(`/notifications/user/count`),
      ]);

      setNotifications(notificationsRes.data);
      setUnreadCounts(countsRes.data);
    } catch {
      setNotifications([]);
      setUnreadCounts({ INVITE: 0, TOTAL: 0 });
    }
  }, [user.id]);

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  useEffect(() => {
    if (!socket || !user.email) return;

    socket.emit('join-room', user.email);

    const handleNotificationCreated = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCounts((prev) => ({
        ...prev,
        [notification.type]: (prev[notification.type] || 0) + 1,
        TOTAL: prev.TOTAL + 1,
      }));
    };

    const handleNotificationDeleted = (deletedNotification: { id: number; type: Notifications }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== deletedNotification.id));
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        if (deletedNotification.type && newCounts[deletedNotification.type] > 0) {
          newCounts[deletedNotification.type] = Math.max(newCounts[deletedNotification.type] - 1, 0);
          newCounts.TOTAL = Math.max(newCounts.TOTAL - 1, 0);
        }
        return newCounts;
      });
    };

    socket.on('invite-notification-created', handleNotificationCreated);
    socket.on('invite-notification-deleted', handleNotificationDeleted);

    return () => {
      socket.off('invite-notification-created', handleNotificationCreated);
      socket.off('invite-notification-deleted', handleNotificationDeleted);
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
    } catch {}
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCounts,
        getNotifications,
        markAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
