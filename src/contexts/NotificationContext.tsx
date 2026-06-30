import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { NotificationService } from '../services/NotificationService';
import type { SystemNotification } from '../types';

const NotificationContext = createContext<SystemNotification[] | undefined>(undefined);
const NotificationUnreadContext = createContext<number | undefined>(undefined);
const NotificationLoadingContext = createContext<boolean | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const unsubscribe = NotificationService.subscribeToNotifications(currentUser.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const unreadCount = React.useMemo(() => notifications.filter(n => !n.readStatus).length, [notifications]);

  return (
    <NotificationLoadingContext.Provider value={loading}>
      <NotificationUnreadContext.Provider value={unreadCount}>
        <NotificationContext.Provider value={notifications}>
          {children}
        </NotificationContext.Provider>
      </NotificationUnreadContext.Provider>
    </NotificationLoadingContext.Provider>
  );
};

export const useNotifications = () => {
  const notifications = useContext(NotificationContext);
  const loading = useContext(NotificationLoadingContext);
  if (notifications === undefined || loading === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return { notifications, loading };
};

export const useNotificationUnreadCount = () => {
  const count = useContext(NotificationUnreadContext);
  if (count === undefined) {
    throw new Error('useNotificationUnreadCount must be used within a NotificationProvider');
  }
  return count;
};
