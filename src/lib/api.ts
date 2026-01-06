const API_URL = import.meta.env.VITE_API_URL;

export async function searchEvents(query: string) {
  const res = await fetch(`${API_URL}/v1/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search failed (${res.status}): ${text}`);
  }

  return res.json();
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  recommendation_id: string | null;
  news_event_id: string | null;
  read_at: string | null;
  created_at: string;
}

export async function getNotifications(userId: string, unreadOnly = false, limit = 50): Promise<Notification[]> {
  const params = new URLSearchParams({ unread_only: String(unreadOnly), limit: String(limit) });
  const res = await fetch(`${API_URL}/v1/notifications/${userId}?${params}`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch notifications: ${res.status}`);
  }
  
  return res.json();
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const res = await fetch(`${API_URL}/v1/notifications/${notificationId}/read`, {
    method: "POST",
  });
  
  if (!res.ok) {
    throw new Error(`Failed to mark notification as read: ${res.status}`);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/v1/notifications/${userId}/read-all`, {
    method: "POST",
  });
  
  if (!res.ok) {
    throw new Error(`Failed to mark all notifications as read: ${res.status}`);
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  const res = await fetch(`${API_URL}/v1/notifications/${userId}/unread-count`);
  
  if (!res.ok) {
    throw new Error(`Failed to get unread count: ${res.status}`);
  }
  
  const data = await res.json();
  return data.unread_count;
}
