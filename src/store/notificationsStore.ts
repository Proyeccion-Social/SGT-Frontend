import { create } from 'zustand';
import type { AppNotification } from '@/features/dashboards/services/notificationsService';

interface NotificationsStore {
  isOpen: boolean;
  unreadCount: number;
  notifications: AppNotification[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  togglePanel: () => void;
  closePanel: () => void;
  openPanel: () => void;
  setUnreadCount: (count: number) => void;
  setNotifications: (notifications: AppNotification[]) => void;
  appendNotifications: (notifications: AppNotification[]) => void;
  removeNotification: (id: string) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markAllAsRead: () => void;
}

export const useNotificationsStore = create<NotificationsStore>()(
  (set) => ({
    isOpen: false,
    unreadCount: 0,
    notifications: [],
    hasMore: true,
    loading: false,
    error: null,

    togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
    closePanel: () => set({ isOpen: false }),
    openPanel: () => set({ isOpen: true }),
    setUnreadCount: (count) => set({ unreadCount: count }),
    setNotifications: (notifications) => set({ notifications }),
    appendNotifications: (notifications) =>
      set((state) => ({
        notifications: [...state.notifications, ...notifications],
      })),
    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: Math.max(0, state.unreadCount - 1),
      })),
    setHasMore: (hasMore) => set({ hasMore }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    markAllAsRead: () =>
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      })),
  })
);
