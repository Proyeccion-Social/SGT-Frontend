import { useEffect } from 'react';
import { useNotificationsStore } from '@/store/notificationsStore';

export function NotificationBadge() {
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/notifications/inbox?page=1&limit=1');
        if (res.ok) {
          const json = await res.json();
          setUnreadCount(json.meta?.unreadCount ?? 0);
        }
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [setUnreadCount]);

  if (unreadCount === 0) return null;

  return (
    <>
      <style>{`
        .ntf-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 18px;
          height: 18px;
          border-radius: 12px;
          background: var(--secondary-200);
          color: var(--secondary-500);
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          line-height: 1;
          pointer-events: none;
          z-index: 10;
        }
      `}</style>
      <span className="ntf-badge">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    </>
  );
}

export default NotificationBadge;
