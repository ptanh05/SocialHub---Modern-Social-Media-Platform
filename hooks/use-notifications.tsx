import useSWR from 'swr';
import { useCallback, useEffect } from 'react';

interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message';
  actorId: string;
  postId?: string;
  content?: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { data, error, mutate } = useSWR<{
    notifications: Notification[];
    unreadCount: number;
  }>('/api/notifications', async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  });

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await fetch(`/api/notifications/${notificationId}`, {
          method: 'PUT',
        });
        mutate();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    [mutate]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      mutate();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [mutate]);

  // Poll for new notifications every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      mutate();
    }, 5000);

    return () => clearInterval(interval);
  }, [mutate]);

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    isLoading: !error && !data,
    isError: !!error,
    markAsRead,
    markAllAsRead,
  };
}
