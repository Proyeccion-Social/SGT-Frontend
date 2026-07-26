const API_URL = import.meta.env.API_URL;

export type AppNotificationType =
  | 'SESSION_REQUEST_RECEIVED'
  | 'SESSION_REQUEST_ACK'
  | 'SESSION_CONFIRMED'
  | 'SESSION_REJECTED'
  | 'SESSION_CANCELLED'
  | 'MODIFICATION_REQUEST'
  | 'MODIFICATION_ACCEPTED'
  | 'MODIFICATION_REJECTED'
  | 'SESSION_DETAILS_UPDATED'
  | 'SESSION_REMINDER_24H'
  | 'SESSION_REMINDER_2H'
  | 'EVALUATION_PENDING'
  | 'EVALUATION_REMINDER'
  | 'AVAILABILITY_CHANGED'
  | 'HOUR_LIMIT_ALERT'
  | 'SESSION_ABSENT';

export interface AppNotification {
  id: string;
  userId: string;
  type: AppNotificationType;
  message: string;
  payload: Record<string, string> | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationsMeta {
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NotificationsResponse {
  data: AppNotification[];
  meta: NotificationsMeta;
}

export interface NotificationsQuery {
  page?: number;
  limit?: number;
  onlyUnread?: boolean;
}

export async function getNotificationsInbox(
  token: string,
  query: NotificationsQuery = {}
): Promise<NotificationsResponse> {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 5),
    ...(query.onlyUnread ? { onlyUnread: 'true' } : {}),
  });

  const res = await fetch(`${API_URL}/api/v1/notifications/inbox?${params}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export async function markAllNotificationsAsRead(
  token: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/v1/notifications/inbox/read-all`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export async function markNotificationAsRead(
  token: string,
  id: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_URL}/api/v1/notifications/inbox/${id}/read`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}


