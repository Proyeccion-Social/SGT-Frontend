import { useEffect, useRef, useState, useCallback } from 'react';
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react';
import { useNotificationsStore } from '@/store/notificationsStore';
import NotificationsPanel from '@/features/dashboards/components/notifications/NotificationsPanel';
import { cn } from '@/lib/utils';

function getTriggerRect(): DOMRect | null {
  const btn = document.getElementById('notification-trigger');
  if (!btn) return null;
  return btn.getBoundingClientRect();
}

export function NotificationsRoot() {
  const isOpen = useNotificationsStore((s) => s.isOpen);
  const togglePanel = useNotificationsStore((s) => s.togglePanel);
  const closePanel = useNotificationsStore((s) => s.closePanel);
  const setNotifications = useNotificationsStore((s) => s.setNotifications);
  const appendNotifications = useNotificationsStore((s) => s.appendNotifications);
  const setHasMore = useNotificationsStore((s) => s.setHasMore);
  const setLoading = useNotificationsStore((s) => s.setLoading);
  const setError = useNotificationsStore((s) => s.setError);
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);
  const [page, setPage] = useState(1);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  const fetchNotifications = useCallback(async (p: number, append: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notifications/inbox?page=${p}&limit=10`);
      if (!res.ok) throw new Error('Error al cargar notificaciones');
      const json = await res.json();
      if (append) {
        appendNotifications(json.data);
      } else {
        setNotifications(json.data);
      }
      setHasMore(json.meta.hasNextPage);
      setUnreadCount(json.meta.unreadCount);
    } catch (err: any) {
      setError(err.message ?? 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [appendNotifications, setError, setHasMore, setLoading, setNotifications, setUnreadCount]);

  useEffect(() => {
    const handleToggle = () => {
      const store = useNotificationsStore.getState();
      if (!store.isOpen) {
        setPage(1);
        fetchNotifications(1, false);
      }
      togglePanel();
    };
    window.addEventListener('toggle-notifications', handleToggle);
    return () => window.removeEventListener('toggle-notifications', handleToggle);
  }, [fetchNotifications, togglePanel]);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const virtualRef = useRef({
    getBoundingClientRect: () =>
      triggerRect ?? new DOMRect(0, 0, 0, 0),
  });

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      if (!open) closePanel();
    },
    placement: 'right-start',
    middleware: [offset(8), flip(), shift({ crossAxis: true, padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (!mounted) return;
    const rect = getTriggerRect();
    setTriggerRect(rect);

    const handleResize = () => {
      setTriggerRect(getTriggerRect());
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [mounted]);

  useEffect(() => {
    if (!visible) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const contentEl = refs.floating.current;
      if (contentEl && !contentEl.contains(target)) {
        const trigger = document.getElementById('notification-trigger');
        const mobileTrigger = document.querySelector('.notification-floating');
        if (
          trigger?.contains(target) ||
          mobileTrigger?.contains(target)
        ) {
          return;
        }
        closePanel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [visible, closePanel, refs.floating]);

  if (!mounted) return null;

  return (
    <div
      ref={refs.setFloating}
      style={{ ...floatingStyles, top: isMobile ? 130 : 100, left: isMobile ? 28 : 80 }}
      className={cn(
        "z-50 ntf-floating",
        visible
          ? "animate-in fade-in-0 slide-in-from-top-1 duration-150"
          : "animate-out fade-out-0 slide-out-to-top-1 duration-150 pointer-events-none"
      )}
      data-notifications-panel
    >
      <style>{`.ntf-floating { max-height: 50vh; }`}</style>
      <NotificationsPanel />
    </div>
  );
}

export default NotificationsRoot;
