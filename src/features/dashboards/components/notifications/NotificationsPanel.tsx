import { useState, useEffect, useRef, useCallback } from 'react';
import { useNotificationsStore } from '@/store/notificationsStore';
import type { AppNotification, AppNotificationType } from '../../services/notificationsService';
import {
  Bell,
  CheckCheck,
  AlertCircle,
  Clock,
  X,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  AlertTriangle,
  UserX,
  MessageSquareWarning,
  Info,
  Loader2,
  Inbox,
  type LucideIcon,
} from 'lucide-react';

const NOTIFICATION_TITLES: Record<AppNotificationType, string> = {
  SESSION_REQUEST_RECEIVED: 'Solicitud de sesión recibida',
  SESSION_REQUEST_ACK: 'Solicitud recibida',
  SESSION_CONFIRMED: 'Sesión confirmada',
  SESSION_REJECTED: 'Sesión rechazada',
  SESSION_CANCELLED: 'Sesión cancelada',
  MODIFICATION_REQUEST: 'Solicitud de modificación',
  MODIFICATION_ACCEPTED: 'Modificación aceptada',
  MODIFICATION_REJECTED: 'Modificación rechazada',
  SESSION_DETAILS_UPDATED: 'Detalles actualizados',
  SESSION_REMINDER_24H: 'Recordatorio 24h',
  SESSION_REMINDER_2H: 'Recordatorio 2h',
  EVALUATION_PENDING: 'Evaluación pendiente',
  EVALUATION_REMINDER: 'Recordatorio de evaluación',
  AVAILABILITY_CHANGED: 'Disponibilidad cambiada',
  HOUR_LIMIT_ALERT: 'Alerta de límite de horas',
  SESSION_ABSENT: 'Sesión sin asistencia',
};

interface NotificationStyle {
  icon: LucideIcon;
  accent: string;
  bg: string;
  border: string;
}

const NOTIFICATION_STYLES: Record<string, NotificationStyle> = {
  success: {
    icon: CheckCheck,
    accent: 'var(--success-default)',
    bg: 'var(--surface-success)',
    border: 'var(--border-success)',
  },
  error: {
    icon: AlertCircle,
    accent: 'var(--error-default)',
    bg: 'var(--surface-error)',
    border: 'var(--border-error)',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'var(--warning-default)',
    bg: 'var(--surface-warning)',
    border: 'var(--border-warning)',
  },
  info: {
    icon: Info,
    accent: 'var(--information-default)',
    bg: 'var(--surface-information)',
    border: 'var(--border-information)',
  },
  request: {
    icon: MessageSquareWarning,
    accent: 'var(--primary-default)',
    bg: 'var(--surface-primary)',
    border: 'var(--neutral-100)',
  },
  reminder: {
    icon: Clock,
    accent: 'var(--loading-default)',
    bg: 'var(--surface-action)',
    border: 'var(--border-action)',
  },
  absent: {
    icon: UserX,
    accent: 'var(--error-default)',
    bg: 'var(--surface-error)',
    border: 'var(--border-error)',
  },
  confirmed: {
    icon: CalendarCheck,
    accent: 'var(--success-default)',
    bg: 'var(--surface-success)',
    border: 'var(--border-success)',
  },
  cancelled: {
    icon: CalendarX,
    accent: 'var(--warning-default)',
    bg: 'var(--surface-warning)',
    border: 'var(--border-warning)',
  },
  pending: {
    icon: CalendarClock,
    accent: 'var(--loading-default)',
    bg: 'var(--surface-action)',
    border: 'var(--border-action)',
  },
};

function getNotificationStyle(type: AppNotificationType): NotificationStyle {
  if (type === 'SESSION_CONFIRMED' || type === 'SESSION_REQUEST_ACK') return NOTIFICATION_STYLES.confirmed;
  if (type === 'SESSION_CANCELLED') return NOTIFICATION_STYLES.cancelled;
  if (type === 'SESSION_REJECTED' || type === 'MODIFICATION_REJECTED') return NOTIFICATION_STYLES.error;
  if (type === 'SESSION_ABSENT') return NOTIFICATION_STYLES.absent;
  if (type === 'HOUR_LIMIT_ALERT') return NOTIFICATION_STYLES.warning;
  if (type === 'SESSION_REQUEST_RECEIVED' || type === 'MODIFICATION_REQUEST') return NOTIFICATION_STYLES.request;
  if (type === 'SESSION_REMINDER_24H' || type === 'SESSION_REMINDER_2H' || type === 'EVALUATION_REMINDER') return NOTIFICATION_STYLES.reminder;
  if (type === 'EVALUATION_PENDING') return NOTIFICATION_STYLES.pending;
  if (type === 'MODIFICATION_ACCEPTED' || type === 'SESSION_DETAILS_UPDATED' || type === 'AVAILABILITY_CHANGED') return NOTIFICATION_STYLES.info;
  return NOTIFICATION_STYLES.info;
}

const LIMIT = 10;

function openSessionDetail(sessionId: string): void {
  document.dispatchEvent(new CustomEvent('open-detail', { detail: { sessionId } }));
}

export function NotificationsPanel() {
  const notifications = useNotificationsStore((s) => s.notifications);
  const hasMore = useNotificationsStore((s) => s.hasMore);
  const loading = useNotificationsStore((s) => s.loading);
  const error = useNotificationsStore((s) => s.error);
  const closePanel = useNotificationsStore((s) => s.closePanel);
  const appendNotifications = useNotificationsStore((s) => s.appendNotifications);
  const removeNotification = useNotificationsStore((s) => s.removeNotification);
  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);
  const setHasMore = useNotificationsStore((s) => s.setHasMore);
  const setLoading = useNotificationsStore((s) => s.setLoading);
  const setError = useNotificationsStore((s) => s.setError);

  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notifications/inbox?page=${p}&limit=10`);
      if (!res.ok) throw new Error('Error al cargar notificaciones');
      const json = await res.json();
      appendNotifications(json.data);
      setHasMore(json.meta.hasNextPage);
      setUnreadCount(json.meta.unreadCount);
    } catch (err: any) {
      setError(err.message ?? 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [appendNotifications, setError, setHasMore, setLoading, setUnreadCount]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          setPage((prev) => {
            const next = prev + 1;
            loadMore(next);
            return next;
          });
        }
      },
      { rootMargin: '200px' }
    );
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, loading, loadMore]);

  const handleView = async (n: AppNotification) => {
    try {
      await fetch(`/api/notifications/${n.id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {}
    removeNotification(n.id);

    const { sessionId, requestId, alertLevel } = n.payload ?? {};
    if (sessionId) {
      openSessionDetail(sessionId);
    } else if (alertLevel) {
      window.dispatchEvent(
        new CustomEvent('toast-show', {
          detail: { message: `Alerta de límite de horas: nivel ${alertLevel}`, variant: 'warning' },
        })
      );
    }
    closePanel();
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {}
    markAllAsRead();
  };

  const handleRetry = () => {
    setPage(1);
    fetchNotifications(1, false);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `hace ${days}d`;
    return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      className="w-[380px] max-md:w-[calc(100vw-56px)] max-h-[70vh] flex flex-col overflow-hidden rounded-4xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 ntf-panel"
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b shrink-0 ntf-header"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold leading-6 tracking-[-0.02em] text-[#3C3C3C]">
            Notificaciones
          </span>
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              className="flex items-center justify-center size-6 rounded-md hover:bg-muted transition-colors"
              onClick={handleMarkAllRead}
              aria-label="Marcar todas como leídas"
            >
              <CheckCheck className="size-4 ntf-mark-all-read" />
            </button>
          )}
          <button
            className="flex items-center justify-center size-6 rounded-md hover:bg-muted transition-colors"
            onClick={() => closePanel()}
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <style>{`
        [data-notifications-list]::-webkit-scrollbar { width: 6px; }
        [data-notifications-list]::-webkit-scrollbar-button { display: none; }
        [data-notifications-list]::-webkit-scrollbar-thumb { background: #e8e8e8; border-radius: 10px; }
        .ntf-panel { max-height: min(70vh, 600px); }
        .ntf-header { border-color: var(--border-primary); }
        .ntf-mark-all-read { color: var(--success-default); }
        .ntf-empty-icon-bg { background: var(--surface-primary); }
        .ntf-empty-icon { color: var(--primary-300); }
        .ntf-empty-title { color: var(--text-body); }
        .ntf-empty-subtitle { color: var(--text-disable); }
        .ntf-error-icon-bg { background: var(--surface-error); }
        .ntf-error-icon { color: var(--error-default); }
        .ntf-error-text { color: var(--text-error); }
        .ntf-retry-button { background: var(--surface-action); color: var(--text-action); }
        .ntf-card-title { color: var(--text-body); }
        .ntf-card-time { color: var(--text-disable); }
        .ntf-card-message { font-family: var(--type-font-family-primary); color: var(--text-body); }
        .ntf-loading-spinner { color: var(--primary-default); }
        .ntf-loading-text { color: var(--text-disable); }
        .ntf-end-text { color: var(--text-disable); }
        .ntf-error-footer { border-color: var(--border-error); }
        .ntf-error-footer-text { color: var(--text-error); }
        .ntf-error-footer-retry { color: var(--text-action); }
      `}</style>
      <div ref={listRef} className="flex-1 overflow-y-auto" data-notifications-list>
        {notifications.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
            <div className="flex items-center justify-center size-16 rounded-full ntf-empty-icon-bg">
              <Inbox className="size-8 ntf-empty-icon" />
            </div>
            <span className="text-sm font-medium ntf-empty-title">
              No tienes notificaciones
            </span>
            <span className="text-xs ntf-empty-subtitle">
              Aquí aparecerán tus notificaciones cuando las recibas
            </span>
          </div>
        )}

        {error && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
            <div className="flex items-center justify-center size-16 rounded-full ntf-error-icon-bg">
              <AlertCircle className="size-8 ntf-error-icon" />
            </div>
            <span className="text-sm font-medium ntf-error-text">
              {error}
            </span>
            <button
              onClick={handleRetry}
              className="px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ntf-retry-button"
            >
              Reintentar
            </button>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="flex flex-col gap-1 p-5 space-y-1">
            {notifications.map((n) => {
              const style = getNotificationStyle(n.type);
              const IconComponent = style.icon;
              const isRead = n.read;
              return (
                <div
                  key={n.id}
                  className="group relative flex items-start gap-3 p-3 rounded-lg transition-all duration-150 cursor-pointer hover:scale-[1.015] hover:opacity-90"
                  style={{
                    background: isRead ? 'transparent' : style.bg,
                    border: `1px solid ${isRead ? 'transparent' : style.border}`,
                    opacity: isRead ? 0.7 : 1,
                  }}
                  onClick={() => handleView(n)}
                >
                  <div
                    className="flex items-center justify-center size-8 rounded-full shrink-0 mt-0.5"
                    style={{ background: style.accent + '20' }}
                  >
                    <IconComponent className="size-4" style={{ color: style.accent }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold truncate tracking-[-0.02em] ntf-card-title">
                        {NOTIFICATION_TITLES[n.type]}
                      </span>
                      <span className="text-[10px] whitespace-nowrap shrink-0 ntf-card-time">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 line-clamp-2 tracking-[-0.02em] ntf-card-message">
                      {n.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div ref={sentinelRef} className="h-4" />

        {loading && (
          <div className="flex items-center justify-center py-4 gap-2">
            <Loader2 className="size-4 animate-spin ntf-loading-spinner" />
            <span className="text-xs ntf-loading-text">
              Cargando notificaciones...
            </span>
          </div>
        )}

        {!hasMore && notifications.length > 0 && !loading && (
          <div className="text-center py-4">
            <span className="text-xs ntf-end-text">
              No hay más notificaciones
            </span>
          </div>
        )}
      </div>

      {error && notifications.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-t shrink-0 ntf-error-footer">
          <span className="text-xs ntf-error-footer-text">
            Error al cargar más notificaciones
          </span>
          <button
            onClick={handleRetry}
            className="text-xs font-medium underline underline-offset-2 ntf-error-footer-retry"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationsPanel;
