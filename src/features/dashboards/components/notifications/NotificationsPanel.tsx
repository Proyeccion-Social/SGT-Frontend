import { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/notifications.css';
import type { AppNotification, NotificationsMeta, AppNotificationType } from '../../services/notificationsService';

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

const LIMIT = 5;

function buildPageRange(totalPages: number): number[] {
  return Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1);
}

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [meta, setMeta] = useState<NotificationsMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notifications/inbox?page=${p}&limit=${LIMIT}`);
      if (!res.ok) throw new Error('Error al cargar notificaciones');
      const json = await res.json();
      setNotifications(json.data);
      setMeta(json.meta);
    } catch (err: any) {
      setError(err.message ?? 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => {
        if (!prev) fetchNotifications(1);
        return !prev;
      });
    };
    window.addEventListener('toggle-notifications', handleToggle);
    return () => window.removeEventListener('toggle-notifications', handleToggle);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const goToPage = (p: number) => {
    setPage(p);
    fetchNotifications(p);
  };

  if (!isOpen) return null;

  const totalPages = meta?.totalPages ?? 1;
  const pageRange = buildPageRange(totalPages);
  const showMore = totalPages > 3;

  return (
    <div className="notif-panel" ref={panelRef}>
      <div className="notif-header">
        <div className="notif-header-left">
          <span className="notif-title">Notificaciones</span>
          {totalPages > 1 && (
            <div className="notif-pagination">
              {pageRange.map((p, idx) => (
                <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <button
                    className={`notif-page-btn${page === p ? ' active' : ''}`}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                  {(idx < pageRange.length - 1 || showMore) && (
                    <span className="notif-page-dots">·····</span>
                  )}
                </span>
              ))}
              {showMore && (
                <button
                  className="notif-page-btn"
                  onClick={() => goToPage(Math.min(page + 1, totalPages))}
                >
                  +
                </button>
              )}
            </div>
          )}
        </div>
        <button className="notif-close" onClick={() => setIsOpen(false)} aria-label="Cerrar notificaciones">
          ✕
        </button>
      </div>

      <div className="notif-divider" />

      <div className="notif-list">
        {loading && <p className="notif-status">Cargando...</p>}

        {!loading && error && <p className="notif-status notif-error">{error}</p>}

        {!loading && !error && notifications.length === 0 && (
          <p className="notif-status">No tienes notificaciones.</p>
        )}

        {!loading && !error && notifications.map(n => (
          <div key={n.id} className="notif-item">
            <div className="notif-item-content">
              <span className="notif-item-title">{NOTIFICATION_TITLES[n.type]}</span>
              <span className="notif-item-desc">{n.message}</span>
            </div>
            <button className="notif-action-btn">Ver</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsPanel;
